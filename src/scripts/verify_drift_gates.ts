import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, spawnSync } from 'child_process';

type GateResult = {
  id: `G${number}`;
  name: string;
  pass: boolean;
  details: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

function collectFiles(dir: string, predicate: (filePath: string) => boolean): string[] {
  const out: string[] = [];
  const walk = (current: string) => {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && predicate(full)) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

function read(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function normalizeSlashes(input: string): string {
  return input.replace(/\\/g, '/');
}

function stripAnsi(input: string): string {
  return input.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '');
}

function gateResult(
  id: GateResult['id'],
  name: string,
  pass: boolean,
  details: string[] = []
): GateResult {
  return { id, name, pass, details };
}

async function checkG1(): Promise<GateResult> {
  const details: string[] = [];

  return await new Promise<GateResult>((resolve) => {
    const child = spawn('npm run mcp:start', {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let output = '';
    let settled = false;
    let timeout: NodeJS.Timeout | null = null;

    const failPattern = /ERR_MODULE_NOT_FOUND|Cannot find module|Failed to start MCP server/i;
    const passPattern = /running on stdio/i;

    const finish = (pass: boolean, reason?: string) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      if (!child.killed) {
        child.kill();
      }

      if (reason) {
        details.push(reason);
      }

      const excerpt = output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(-10);
      if (excerpt.length > 0) {
        details.push('Output excerpt:');
        details.push(...excerpt);
      }

      resolve(gateResult('G1', 'MCP Runtime', pass, details));
    };

    const onData = (chunk: Buffer) => {
      output += chunk.toString();

      if (failPattern.test(output)) {
        finish(false, 'Detected runtime/module startup error.');
        return;
      }

      if (passPattern.test(output)) {
        finish(true, 'MCP server reached running state.');
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    child.on('error', (err) => {
      finish(false, `Failed to start process: ${err.message}`);
    });

    child.on('exit', (code) => {
      if (settled) return;
      if (passPattern.test(output) && !failPattern.test(output)) {
        finish(true, `Process exited (code: ${code ?? 'null'}) after successful startup signal.`);
      } else {
        finish(false, `Process exited before success signal (code: ${code ?? 'null'}).`);
      }
    });

    timeout = setTimeout(() => {
      finish(false, 'Timed out waiting for MCP startup signal.');
    }, 20000);
  });
}

function checkG2(): GateResult {
  const files = [
    path.resolve(ROOT, 'src/modules/delivery/api/build.ts'),
    path.resolve(ROOT, 'src/modules/delivery/BuildQueue.ts'),
  ];
  const violations: string[] = [];
  const banned = [/\bentity_id\b/g, /\bJOIN\s+entities\b/gi];

  for (const file of files) {
    const content = read(file);
    for (const pattern of banned) {
      if (pattern.test(content)) {
        violations.push(`${normalizeSlashes(path.relative(ROOT, file))}: matches ${pattern}`);
      }
    }
  }

  return gateResult('G2', 'Build State Schema', violations.length === 0, violations);
}

function checkG3(): GateResult {
  const tsFiles = collectFiles(path.resolve(ROOT, 'src'), (filePath) => {
    const normalized = normalizeSlashes(filePath);
    if (!normalized.endsWith('.ts') && !normalized.endsWith('.tsx')) {
      return false;
    }
    return !/\.test\.tsx?$|\.spec\.tsx?$/.test(normalized);
  });

  const violations: string[] = [];
  const importPattern = /from\s+['"][^'"]*core\/entities\.js['"]/g;

  for (const file of tsFiles) {
    const content = read(file);
    if (importPattern.test(content)) {
      violations.push(normalizeSlashes(path.relative(ROOT, file)));
    }
  }

  return gateResult('G3', 'Legacy Core Imports', violations.length === 0, violations);
}

function collectDocFiles(): string[] {
  const docsDir = path.resolve(ROOT, 'docs');
  const activeDir = path.resolve(ROOT, 'agent_context/active');
  const files: string[] = [
    path.resolve(ROOT, 'README.md'),
    path.resolve(ROOT, 'DEPLOY.md'),
  ];

  if (fs.existsSync(docsDir)) {
    files.push(...collectFiles(docsDir, (f) => normalizeSlashes(f).endsWith('.md')));
  }
  if (fs.existsSync(activeDir)) {
    files.push(...collectFiles(activeDir, (f) => normalizeSlashes(f).endsWith('.md')));
  }

  return files;
}

function checkG4(): GateResult {
  const files = collectDocFiles();
  const banned = [
    '/api/entities',
    'EntityInputSchema',
    '/api/derive/all',
    '/api/derive/:id',
    'viv5_sandbox_unlocked',
  ];
  const violations: string[] = [];

  for (const file of files) {
    const content = read(file);
    for (const pattern of banned) {
      if (content.includes(pattern)) {
        violations.push(`${normalizeSlashes(path.relative(ROOT, file))}: contains "${pattern}"`);
      }
    }
  }

  return gateResult('G4', 'Canonical Doc API Drift', violations.length === 0, violations);
}

function checkG5(): GateResult {
  const pkg = JSON.parse(read(path.resolve(ROOT, 'package.json'))) as {
    scripts?: Record<string, string>;
  };
  const validScripts = new Set(Object.keys(pkg.scripts || {}));
  const files = collectDocFiles();
  const violations: string[] = [];
  const regex = /npm run ([A-Za-z0-9:_-]+)/g;

  for (const file of files) {
    const content = read(file);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const scriptName = match[1] as string;
      if (!validScripts.has(scriptName)) {
        violations.push(
          `${normalizeSlashes(path.relative(ROOT, file))}: npm run ${scriptName} (missing in package.json)`
        );
      }
    }
  }

  return gateResult('G5', 'Script Contract', violations.length === 0, violations);
}

function checkG6(): GateResult {
  const files = [
    path.resolve(ROOT, 'README.md'),
    path.resolve(ROOT, 'DEPLOY.md'),
    ...collectFiles(path.resolve(ROOT, 'docs'), (f) => normalizeSlashes(f).endsWith('.md')),
  ].filter((f) => fs.existsSync(f));

  const banned = ['dist/oblio/oblio', 'themes/victory-studio/dist'];
  const violations: string[] = [];

  for (const file of files) {
    const content = read(file);
    for (const pattern of banned) {
      if (content.includes(pattern)) {
        violations.push(`${normalizeSlashes(path.relative(ROOT, file))}: contains "${pattern}"`);
      }
    }
  }

  return gateResult('G6', 'Deployment/Theme Path Contract', violations.length === 0, violations);
}

function runCommand(command: string, timeoutMs: number): {
  pass: boolean;
  output: string;
} {
  const result = spawnSync(command, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024 * 20,
    shell: true,
  });

  const output = stripAnsi(`${result.stdout || ''}\n${result.stderr || ''}`.trim());
  const pass = result.status === 0 && !result.error;
  return { pass, output };
}

function checkG7(): GateResult {
  const result = runCommand('npm run docs:verify', 120000);
  const details = result.output
    ? result.output.split('\n').map((line) => line.trim()).filter(Boolean).slice(-20)
    : [];
  return gateResult('G7', 'OpenAPI Parity', result.pass, details);
}

function checkG8(): GateResult {
  const result = runCommand('npx vitest run src/api/routes/__tests__/pages.test.ts', 180000);
  const details = result.output
    ? result.output.split('\n').map((line) => line.trim()).filter(Boolean).slice(-20)
    : [];
  return gateResult('G8', 'Pages Regression', result.pass, details);
}

function renderReport(results: GateResult[]): string {
  const passed = results.filter((r) => r.pass).length;
  const lines: string[] = [];

  lines.push('# Drift Gate Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Summary: ${passed}/${results.length} PASS`);
  lines.push('');
  lines.push('| Gate | Name | Status |');
  lines.push('| :--- | :--- | :--- |');

  for (const result of results) {
    lines.push(`| ${result.id} | ${result.name} | ${result.pass ? 'PASS' : 'FAIL'} |`);
  }

  lines.push('');

  for (const result of results) {
    lines.push(`## ${result.id} ${result.name}: ${result.pass ? 'PASS' : 'FAIL'}`);
    if (result.details.length === 0) {
      lines.push('- No additional details.');
    } else {
      for (const detail of result.details) {
        lines.push(`- ${detail}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  const results: GateResult[] = [];

  results.push(await checkG1());
  results.push(checkG2());
  results.push(checkG3());
  results.push(checkG4());
  results.push(checkG5());
  results.push(checkG6());
  results.push(checkG7());
  results.push(checkG8());

  for (const result of results) {
    console.log(`${result.id} ${result.name}: ${result.pass ? 'PASS' : 'FAIL'}`);
    if (!result.pass) {
      for (const detail of result.details) {
        console.log(`  - ${detail}`);
      }
    }
  }

  const report = renderReport(results);
  const reportPathArg = process.argv.find((arg) => arg.startsWith('--report='));
  if (reportPathArg) {
    const reportPath = reportPathArg.slice('--report='.length);
    const absolute = path.isAbsolute(reportPath)
      ? reportPath
      : path.resolve(ROOT, reportPath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, report, 'utf8');
    console.log(`Report written: ${normalizeSlashes(path.relative(ROOT, absolute))}`);
  }

  const failed = results.filter((result) => !result.pass);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Gate runner failed:', err);
  process.exit(1);
});


import fs from 'fs';
import path from 'path';
import { DerivedPage } from './compiler.js';

export class StaticWriter {
  private distDir: string;

  constructor() {
    this.distDir = path.resolve(process.cwd(), 'dist_test');
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
  }

  public async writeEntity(slug: string, data: DerivedPage) {
    // 1. Determine Output Path
    // e.g. dist/product-a/index.html
    const outDir = path.join(this.distDir, slug);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 2. Write Data JSON (Hydration)
    const jsonPath = path.join(outDir, 'data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    // 3. Write HTML (Shell)
    // For now, we just copy the base shell and inject a script tag for hydration
    const htmlPath = path.join(outDir, 'index.html');
    const shell = this.getShell(data);
    fs.writeFileSync(htmlPath, shell);

    console.log(`[StaticWriter] Wrote ${slug} to ${outDir}`);
  }

  private getShell(data: DerivedPage): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.entityName} | Keimenon</title>
    <script>
        window.__KEIMENON_DATA__ = ${JSON.stringify(data)};
    </script>
    <script type="module" src="/assets/main.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
    `.trim();
  }
}

export const staticWriter = new StaticWriter();

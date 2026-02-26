import path from 'path';
import { pathToFileURL } from 'url';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import {
  InterpreterExecutorDefinition,
  listInterpreterExecutorDefinitions,
} from './interpreter_executor_definitions.js';
import {
  hasInterpreterExecutor,
  unregisterInterpreterExecutor,
} from './interpreter_executor_registry.js';

interface RuntimeRegistrationSpec {
  module: string;
  exportName: string;
  enabled: boolean;
}

export interface InterpreterExecutorPluginLoadResult {
  loaded: Array<{ executorKey: string; module: string; exportName: string }>;
  skipped: Array<{ executorKey: string; reason: string }>;
  unloaded: Array<{ executorKey: string; reason: string }>;
  missing: Array<{ executorKey: string; reason: string }>;
  errors: Array<{ executorKey: string; message: string }>;
}

const loadedRegistrationFunctions = new Set<string>();
const knownManagedKeys = new Set<string>();

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function extractRuntimeRegistrationSpec(
  definition: InterpreterExecutorDefinition
): RuntimeRegistrationSpec | undefined {
  const metadata = definition.metadata;
  if (!isRecord(metadata)) return undefined;

  const raw =
    (isRecord(metadata.runtime_registration) ? metadata.runtime_registration : undefined) ||
    (isRecord(metadata.runtimeRegistration) ? metadata.runtimeRegistration : undefined);
  if (!raw) return undefined;

  const moduleCandidate = [raw.module, raw.module_path, raw.modulePath, raw.path]
    .find((item: unknown) => typeof item === 'string' && item.trim().length > 0);
  if (!moduleCandidate) return undefined;

  const exportCandidate = [raw.export, raw.export_name, raw.exportName]
    .find((item: unknown) => typeof item === 'string' && item.trim().length > 0);

  return {
    module: String(moduleCandidate).trim(),
    exportName: exportCandidate ? String(exportCandidate).trim() : 'default',
    enabled: raw.enabled !== false,
  };
}

function resolveModuleSpecifier(modulePath: string): string {
  const trimmed = modulePath.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('file://')) return trimmed;

  const looksAbsolute =
    path.isAbsolute(trimmed) || /^[A-Za-z]:[\\/]/.test(trimmed);
  if (trimmed.startsWith('.') || looksAbsolute) {
    const absolute = looksAbsolute ? trimmed : path.resolve(process.cwd(), trimmed);
    return pathToFileURL(absolute).href;
  }

  return trimmed;
}

function getRegistryFunctionCacheKey(specifier: string, exportName: string): string {
  return `${specifier}#${exportName}`;
}

export function resetInterpreterExecutorPluginLoaderCache(): void {
  loadedRegistrationFunctions.clear();
  knownManagedKeys.clear();
}

export async function loadInterpreterExecutorPlugins(
  accountId: string = DEFAULT_ACCOUNT_ID,
  options: { force?: boolean } = {}
): Promise<InterpreterExecutorPluginLoadResult> {
  const runtimeAccountId = DEFAULT_ACCOUNT_ID;
  void accountId;
  const result: InterpreterExecutorPluginLoadResult = {
    loaded: [],
    skipped: [],
    unloaded: [],
    missing: [],
    errors: [],
  };

  const definitions = listInterpreterExecutorDefinitions(runtimeAccountId);
  const runtimeDefs: Array<{ definition: InterpreterExecutorDefinition; spec: RuntimeRegistrationSpec }> = [];
  const desiredKeys = new Set<string>();

  for (const definition of definitions) {
    const spec = extractRuntimeRegistrationSpec(definition);
    if (!spec) continue;

    runtimeDefs.push({ definition, spec });
    knownManagedKeys.add(definition.key);
    if (definition.is_active !== false && spec.enabled) {
      desiredKeys.add(definition.key);
    }
  }

  for (const { definition, spec } of runtimeDefs) {
    if (definition.is_active === false) {
      result.skipped.push({
        executorKey: definition.key,
        reason: 'definition is inactive',
      });
      continue;
    }

    if (!spec.enabled) {
      result.skipped.push({
        executorKey: definition.key,
        reason: 'runtime registration is disabled',
      });
      continue;
    }

    const specifier = resolveModuleSpecifier(spec.module);
    const cacheKey = getRegistryFunctionCacheKey(specifier, spec.exportName);
    if (!options.force && loadedRegistrationFunctions.has(cacheKey)) {
      result.skipped.push({
        executorKey: definition.key,
        reason: `registration already loaded (${spec.exportName})`,
      });
      continue;
    }

    try {
      const mod = await import(specifier);
      const registrationFn = (mod as any)[spec.exportName];

      if (typeof registrationFn !== 'function') {
        throw new Error(`Export "${spec.exportName}" is not a function`);
      }

      await registrationFn();
      loadedRegistrationFunctions.add(cacheKey);

      result.loaded.push({
        executorKey: definition.key,
        module: spec.module,
        exportName: spec.exportName,
      });
    } catch (error) {
      result.errors.push({
        executorKey: definition.key,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const key of Array.from(knownManagedKeys)) {
    if (desiredKeys.has(key)) continue;
    if (unregisterInterpreterExecutor(key)) {
      result.unloaded.push({
        executorKey: key,
        reason: 'executor is no longer desired by active runtime definitions',
      });
    }
  }

  for (const key of desiredKeys) {
    if (!hasInterpreterExecutor(key)) {
      result.missing.push({
        executorKey: key,
        reason: 'executor definition is active but no runtime executor is registered',
      });
    }
  }

  return result;
}

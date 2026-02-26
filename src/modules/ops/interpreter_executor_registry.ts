import { DataRecord, DataRecordInput } from '../../core/types.js';
import { InterpreterEvent, InterpreterPipelineStage } from './interpreter_pipeline.js';

export interface InterpreterExecutorContext {
  event: InterpreterEvent;
  type: string;
  stage: InterpreterPipelineStage;
  record: DataRecordInput | DataRecord;
  previousRecord?: DataRecord;
  context?: any;
  runCodeHooks: () => Promise<void>;
}

export type InterpreterExecutor = (ctx: InterpreterExecutorContext) => Promise<void> | void;

const executorRegistry = new Map<string, InterpreterExecutor>();

export function registerInterpreterExecutor(
  key: string,
  executor: InterpreterExecutor,
  options: { overwrite?: boolean } = {}
): void {
  const normalized = key.trim();
  if (!normalized) {
    throw new Error('Interpreter executor key cannot be empty');
  }

  if (executorRegistry.has(normalized) && !options.overwrite) {
    throw new Error(`Interpreter executor already registered: ${normalized}`);
  }

  executorRegistry.set(normalized, executor);
}

export function unregisterInterpreterExecutor(key: string): boolean {
  return executorRegistry.delete(key.trim());
}

export function hasInterpreterExecutor(key: string): boolean {
  return executorRegistry.has(key.trim());
}

export function getInterpreterExecutor(key: string): InterpreterExecutor | undefined {
  return executorRegistry.get(key.trim());
}

export function listInterpreterExecutors(): string[] {
  return Array.from(executorRegistry.keys()).sort();
}

export async function executeInterpreterExecutor(
  key: string,
  ctx: InterpreterExecutorContext
): Promise<void> {
  const executor = getInterpreterExecutor(key);
  if (!executor) {
    throw new Error(`No interpreter executor registered for "${key}"`);
  }

  await executor(ctx);
}

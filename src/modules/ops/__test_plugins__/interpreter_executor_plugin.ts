import {
  hasInterpreterExecutor,
  registerInterpreterExecutor,
  unregisterInterpreterExecutor,
} from '../interpreter_executor_registry.js';

export const TEST_EXECUTOR_KEY = 'test.dynamic_plugin';

let registrationCount = 0;

export function registerTestInterpreterExecutorPlugin(): void {
  registrationCount += 1;
  if (!hasInterpreterExecutor(TEST_EXECUTOR_KEY)) {
    registerInterpreterExecutor(TEST_EXECUTOR_KEY, () => {});
  }
}

export function getTestPluginRegistrationCount(): number {
  return registrationCount;
}

export function resetTestInterpreterExecutorPlugin(): void {
  registrationCount = 0;
  unregisterInterpreterExecutor(TEST_EXECUTOR_KEY);
}

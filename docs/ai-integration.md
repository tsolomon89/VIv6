# AI Credentials and Agent Integration

The VI v5 (Oblio) system treats AI not as an external black box, but as an asynchronous Actor capable of fulfilling Activities and advancing Opportunities.

## 1. Provider Adapter Pattern
The system implements a generic `AIProvider` interface (e.g., `OpenAIProvider`) to standardize completions, streaming, and tool calls.
- Maps varying vendor schemas into unified `CompletionResult` and `ProviderToolCall` formats.
- Ensures the core workflow engine is vendor-agnostic.

## 2. Infrastructure & Tracking
- **`ai_credentials`**: Stores AES-256-GCM encrypted API keys mapped to an `account_id` and a `provider` (e.g., `openai`). Enables multi-tenant BYOK (Bring Your Own Key) or governed shared keys. Supports token and cost limits.
- **`ai_usage_log`**: Every completion logs tokens (prompt & completion) and cost estimates attributed to the specific `account_id`, `model`, and optionally the source `activity_id`.

## 3. The Execution Scheduler
Rather than synchronous AI execution blocking the main API thread, the system leverages a Background Scheduler (`src/modules/ai/execution/scheduler.ts`).

1. **Polling**: The scheduler checks for `activity` records where `ai_execution.status === 'pending'`.
2. **Execution**: It compiles the context and prompts the relevant model via the `executeActivity` runner.
3. **Closing the Loop (Evaluation)**: Once the AI completes its execution (potentially writing data back into the EAV record), the scheduler immediately evaluates the Activity's `OblioQualifiers` (`evaluateActivityAfterExecution()`).
4. **Winning**: If all exit qualifiers pass post-execution, the Activity is marked as "Won" and the pipeline progresses.

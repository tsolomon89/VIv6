export type QueryValue = string | string[] | undefined;

export function firstQueryValue(value: QueryValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseQueryInt(value: QueryValue, fallback?: number): number | undefined {
  const raw = firstQueryValue(value);
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

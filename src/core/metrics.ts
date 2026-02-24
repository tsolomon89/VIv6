/**
 * Simple Prometheus Metrics Module
 *
 * Lightweight implementation of Prometheus metrics without external dependencies.
 * Exposes application metrics in Prometheus text format at /api/metrics.
 *
 * Supported metric types:
 * - Counter: Monotonically increasing value
 * - Gauge: Value that can go up or down
 * - Histogram: Distribution of values with configurable buckets
 */

// --- Metric Types ---

interface MetricLabels {
    [key: string]: string | number;
}

interface CounterMetric {
    type: 'counter';
    name: string;
    help: string;
    values: Map<string, number>;
}

interface GaugeMetric {
    type: 'gauge';
    name: string;
    help: string;
    values: Map<string, number>;
}

interface HistogramBucket {
    le: number;
    count: number;
}

interface HistogramValue {
    buckets: HistogramBucket[];
    sum: number;
    count: number;
}

interface HistogramMetric {
    type: 'histogram';
    name: string;
    help: string;
    bucketBoundaries: number[];
    values: Map<string, HistogramValue>;
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

// --- Registry ---

const metrics = new Map<string, Metric>();

function labelKey(labels: MetricLabels): string {
    const entries = Object.entries(labels).sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([k, v]) => `${k}="${v}"`).join(',');
}

// --- Counter ---

export function createCounter(name: string, help: string): {
    inc: (labels?: MetricLabels, value?: number) => void;
} {
    const metric: CounterMetric = {
        type: 'counter',
        name,
        help,
        values: new Map(),
    };
    metrics.set(name, metric);

    return {
        inc(labels: MetricLabels = {}, value = 1) {
            const key = labelKey(labels);
            const current = metric.values.get(key) || 0;
            metric.values.set(key, current + value);
        },
    };
}

// --- Gauge ---

export function createGauge(name: string, help: string): {
    set: (labels: MetricLabels, value: number) => void;
    inc: (labels?: MetricLabels, value?: number) => void;
    dec: (labels?: MetricLabels, value?: number) => void;
} {
    const metric: GaugeMetric = {
        type: 'gauge',
        name,
        help,
        values: new Map(),
    };
    metrics.set(name, metric);

    return {
        set(labels: MetricLabels = {}, value: number) {
            metric.values.set(labelKey(labels), value);
        },
        inc(labels: MetricLabels = {}, value = 1) {
            const key = labelKey(labels);
            const current = metric.values.get(key) || 0;
            metric.values.set(key, current + value);
        },
        dec(labels: MetricLabels = {}, value = 1) {
            const key = labelKey(labels);
            const current = metric.values.get(key) || 0;
            metric.values.set(key, current - value);
        },
    };
}

// --- Histogram ---

export function createHistogram(name: string, help: string, buckets: number[] = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]): {
    observe: (labels: MetricLabels, value: number) => void;
} {
    const sortedBuckets = [...buckets].sort((a, b) => a - b);
    const metric: HistogramMetric = {
        type: 'histogram',
        name,
        help,
        bucketBoundaries: sortedBuckets,
        values: new Map(),
    };
    metrics.set(name, metric);

    return {
        observe(labels: MetricLabels = {}, value: number) {
            const key = labelKey(labels);
            let histValue = metric.values.get(key);
            if (!histValue) {
                histValue = {
                    buckets: sortedBuckets.map(le => ({ le, count: 0 })),
                    sum: 0,
                    count: 0,
                };
                metric.values.set(key, histValue);
            }

            histValue.sum += value;
            histValue.count += 1;

            for (const bucket of histValue.buckets) {
                if (value <= bucket.le) {
                    bucket.count += 1;
                }
            }
        },
    };
}

// --- Export Prometheus Format ---

export function getMetrics(): string {
    const lines: string[] = [];

    for (const metric of metrics.values()) {
        lines.push(`# HELP ${metric.name} ${metric.help}`);
        lines.push(`# TYPE ${metric.name} ${metric.type}`);

        if (metric.type === 'counter' || metric.type === 'gauge') {
            for (const [key, value] of metric.values) {
                const labelStr = key ? `{${key}}` : '';
                lines.push(`${metric.name}${labelStr} ${value}`);
            }
        } else if (metric.type === 'histogram') {
            for (const [key, histValue] of metric.values) {
                const baseLabels = key ? key + ',' : '';
                for (const bucket of histValue.buckets) {
                    lines.push(`${metric.name}_bucket{${baseLabels}le="${bucket.le}"} ${bucket.count}`);
                }
                lines.push(`${metric.name}_bucket{${baseLabels}le="+Inf"} ${histValue.count}`);
                const sumLabels = key ? `{${key}}` : '';
                lines.push(`${metric.name}_sum${sumLabels} ${histValue.sum}`);
                lines.push(`${metric.name}_count${sumLabels} ${histValue.count}`);
            }
        }

        lines.push('');
    }

    return lines.join('\n');
}

export function getMetricsAsJSON(): object[] {
    const result: object[] = [];

    for (const metric of metrics.values()) {
        if (metric.type === 'counter' || metric.type === 'gauge') {
            result.push({
                name: metric.name,
                type: metric.type,
                help: metric.help,
                values: Object.fromEntries(metric.values),
            });
        } else if (metric.type === 'histogram') {
            const values: object[] = [];
            for (const [key, histValue] of metric.values) {
                values.push({
                    labels: key,
                    buckets: histValue.buckets,
                    sum: histValue.sum,
                    count: histValue.count,
                });
            }
            result.push({
                name: metric.name,
                type: metric.type,
                help: metric.help,
                values,
            });
        }
    }

    return result;
}

// --- Pre-defined Metrics ---

// HTTP Metrics
export const httpRequestDuration = createHistogram(
    'http_request_duration_seconds',
    'Duration of HTTP requests in seconds',
    [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
);

export const httpRequestsTotal = createCounter(
    'http_requests_total',
    'Total number of HTTP requests'
);

// Database Metrics
export const dbQueryDuration = createHistogram(
    'db_query_duration_seconds',
    'Duration of database queries in seconds',
    [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
);

export const dbConnectionStatus = createGauge(
    'db_connection_status',
    'Database connection status (1 = connected, 0 = disconnected)'
);

// Business Metrics
export const recordsCreatedTotal = createCounter(
    'records_created_total',
    'Total number of records created'
);

export const recordsUpdatedTotal = createCounter(
    'records_updated_total',
    'Total number of records updated'
);

export const activitiesCompletedTotal = createCounter(
    'activities_completed_total',
    'Total number of activities completed'
);

// Scheduler Metrics
export const schedulerStatus = createGauge(
    'scheduler_status',
    'Scheduler running status (1 = running, 0 = stopped)'
);

// Constraint Validation Metrics
export const constraintViolationsTotal = createCounter(
    'constraint_violations_total',
    'Total number of constraint violations'
);

// --- Helper Functions ---

/**
 * Get route pattern from Express path (normalize dynamic segments)
 */
export function normalizeRoutePath(path: string): string {
    // Replace UUIDs with :id
    let normalized = path.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        ':id'
    );
    // Replace numeric IDs with :id
    normalized = normalized.replace(/\/\d+(?=\/|$)/g, '/:id');
    // Remove query strings
    normalized = normalized.split('?')[0];
    return normalized;
}

/**
 * Record an HTTP request metric
 */
export function recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    durationSeconds: number
): void {
    const route = normalizeRoutePath(path);
    httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSeconds);
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
}

/**
 * Record a database query metric
 */
export function recordDbQuery(
    operation: string,
    table: string,
    durationSeconds: number
): void {
    dbQueryDuration.observe({ operation, table }, durationSeconds);
}

/**
 * Update scheduler status
 */
export function updateSchedulerStatus(
    schedulerType: 'ai' | 'workflow' | 'health',
    running: boolean
): void {
    schedulerStatus.set({ scheduler_type: schedulerType }, running ? 1 : 0);
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
    metrics.clear();
}

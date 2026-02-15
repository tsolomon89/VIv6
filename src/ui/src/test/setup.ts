import '@testing-library/jest-dom/vitest';
import { vi, expect, beforeAll, afterAll } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

// Extend Vitest's expect with accessibility matchers
expect.extend(matchers);

// Mock the api module
vi.mock('../lib/api', () => ({
    api: {
        listFilteredDimensionValues: vi.fn(),
        getEntity: vi.fn(),
        listEntities: vi.fn(),
        createEntity: vi.fn(),
        createRelationship: vi.fn(),
        deleteRelationship: vi.fn(),
    },
}));

// Mock BrandContext
vi.mock('../lib/BrandContext', () => ({
    useBrand: () => ({
        activeBrandId: 'test-brand-id',
        setActiveBrandId: vi.fn(),
    }),
}));

// Silence console.error for expected errors in tests
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        // Suppress React act() warnings and expected errors
        if (typeof args[0] === 'string' &&
            (args[0].includes('Warning: An update to') ||
             args[0].includes('act(...)') ||
             args[0].includes('useFieldDependency must be used'))) {
            return;
        }
        originalConsoleError.apply(console, args);
    };
});

afterAll(() => {
    console.error = originalConsoleError;
});

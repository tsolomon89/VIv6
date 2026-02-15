/// <reference types="vitest" />
import 'vitest-axe/extend-expect';

declare module 'vitest' {
    interface Assertion<T = any> {
        toHaveNoViolations(): T;
    }
    interface AsymmetricMatchersContaining {
        toHaveNoViolations(): any;
    }
}


import { BindingSignature, PresetRegistry } from '../types';
import { PRESET_REGISTRY } from '../presets/registry';

// Define the critical signatures that MUST have at least one preset
export const REQUIRED_SIGNATURES: BindingSignature[] = [
    { kind: 'self' },
    { kind: 'related', target: 'product', cardinality: 'many' },
    { kind: 'related', target: 'useCase', cardinality: 'many' },
    { kind: 'related', target: 'feature', cardinality: 'many' },
    { kind: 'related', target: 'solution', cardinality: 'many' },
];

export interface CoverageReport {
    missing: BindingSignature[];
    count: number;
    total: number;
}

const signatureToString = (s: BindingSignature) => {
    if (s.kind === 'self') return 'self';
    return `${s.kind}.${s.target}.${s.cardinality}`;
};

export const checkCoverage = (registry: PresetRegistry = PRESET_REGISTRY): CoverageReport => {
    const missing: BindingSignature[] = [];
    const presets = Object.values(registry);

    REQUIRED_SIGNATURES.forEach(req => {
        const hasMatch = presets.some(p => {
            if (p.signature.kind !== req.kind) return false;
            if (p.signature.kind === 'self') return true;
            if (req.kind === 'related') {
                return p.signature.target === req.target && p.signature.cardinality === req.cardinality;
            }
            return false;
        });

        if (!hasMatch) {
            missing.push(req);
        }
    });

    return {
        missing,
        count: REQUIRED_SIGNATURES.length - missing.length,
        total: REQUIRED_SIGNATURES.length
    };
};

export const getMissingSignaturesLabel = (missing: BindingSignature[]): string => {
    return missing.map(signatureToString).join(', ');
};

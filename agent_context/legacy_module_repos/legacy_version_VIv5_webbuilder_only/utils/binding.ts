
import { Binding, BindingSignature } from '../types';

export const getBindingSignature = (binding: Binding): BindingSignature => {
    if (binding.kind === 'self') {
        return { kind: 'self' };
    }
    const { kind, target, cardinality, relationKey } = binding;
    return { kind, target, cardinality, relationKey };
};

export const matchesSignature = (binding: Binding, signature: BindingSignature): boolean => {
    const derived = getBindingSignature(binding);
    
    if (derived.kind !== signature.kind) return false;
    
    if (derived.kind === 'self' && signature.kind === 'self') return true;
    
    if (derived.kind === 'related' && signature.kind === 'related') {
        if (derived.target !== signature.target) return false;
        if (derived.cardinality !== signature.cardinality) return false;
        
        // relationKey rule: if preset declares it, must match. If preset omits, wildcard.
        if (signature.relationKey && signature.relationKey !== derived.relationKey) return false;
        
        return true;
    }
    
    return false;
};

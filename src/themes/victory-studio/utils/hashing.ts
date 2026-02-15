
// Deterministic JSON stringify (handles key sorting and id exclusion)
export const stableStringify = (obj: any): string => {
    // Handle primitives
    if (typeof obj !== 'object' || obj === null) {
        return JSON.stringify(obj);
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }

    // Handle Objects (Sort keys, exclude 'id')
    return '{' + Object.keys(obj)
        .filter(k => k !== 'id') // EXCLUDE ID from hash to allow runtime instantiation
        .sort()
        .map(k => JSON.stringify(k) + ':' + stableStringify(obj[k]))
        .join(',') + '}';
};

// Simple DJB2-like string hash
export const computeHash = (str: string): string => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return (hash >>> 0).toString(16); // Force unsigned 32-bit hex
};

export const hashConfig = (config: any): string => {
    // We strip 'id' fields to ensure that a preset definition is hashed purely on its 
    // content/behavior, not its instance identity.
    const json = stableStringify(config);
    return computeHash(json);
};

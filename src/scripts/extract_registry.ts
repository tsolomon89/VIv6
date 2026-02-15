
import fs from 'fs';
import path from 'path';
import { PRESET_REGISTRY } from '../themes/victory-studio/presets/registry.js';

const OUT_PATH = path.resolve(process.cwd(), 'data/components.json');

console.log('📦 Extracting Component Registry...');

const components = Object.entries(PRESET_REGISTRY).map(([key, preset]) => ({
    key: preset.key,
    signature: preset.signature,
    description: `Preset for ${preset.signature.kind} ${preset.signature.target || ''}`,
    // In a real scenario, we would infer props from a schema. 
    // Here we can expose the 'config' structure as a hint.
    defaultConfig: preset.config
}));

fs.writeFileSync(OUT_PATH, JSON.stringify(components, null, 2));

console.log(`✅ Wrote ${components.length} components to ${OUT_PATH}`);

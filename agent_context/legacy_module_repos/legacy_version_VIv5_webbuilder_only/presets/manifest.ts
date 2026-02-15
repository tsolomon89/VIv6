
/**
 * PRESET MANIFEST (Golden Master)
 * 
 * This file maps Presentation Keys to their expected Content Hash.
 * 
 * Guardrail Rule:
 * If you modify a preset's config in `registry.ts`, the hash will change.
 * - If the change is trivial/cosmetic, update the hash here.
 * - If the change alters behavior significantly, CREATE A NEW VERSION (.v2)
 *   instead of mutating the existing .v1 entry.
 * 
 * To generate new hashes, look at the Console in Debug Mode.
 */

export const PRESET_MANIFEST: Record<string, string> = {
    // 'self.hero.v1': '...', 
    // Populated by developers via console output
};


import { PageTemplate, PresetRegistry, SectionInstance, ConfigState } from '../types';
import { matchesSignature } from './binding';
import { validatePresetIntegrity } from './integrity';

export interface ValidationError {
    sectionId: string;
    message: string;
    severity: 'error' | 'warning';
}

const VERSION_REGEX = /\.v\d+$/;

export const validateSection = (section: SectionInstance, registry: PresetRegistry): ValidationError[] => {
    const errors: ValidationError[] = [];
    const id = section.id || 'unknown';

    // 0. Runtime Structure Checks (Guard against partial/invalid JSON)
    if (!section.binding) {
        errors.push({ sectionId: id, message: 'Missing required object: binding.', severity: 'error' });
    } else if (!section.binding.kind) {
        errors.push({ sectionId: id, message: 'Missing required field: binding.kind.', severity: 'error' });
    }

    if (!section.placement) {
        errors.push({ sectionId: id, message: 'Missing required object: placement.', severity: 'error' });
    } else if (!section.placement.slot) {
        errors.push({ sectionId: id, message: 'Missing required field: placement.slot.', severity: 'error' });
    }

    if (!section.presentationKey) {
        errors.push({ sectionId: id, message: 'Missing required field: presentationKey.', severity: 'error' });
    }

    // Stop here if basic structure is missing to prevent runtime errors accessing properties
    if (errors.length > 0) return errors;

    const preset = registry[section.presentationKey];

    // 1. Check Preset Existence
    if (!preset) {
        errors.push({
            sectionId: id,
            message: `Presentation preset '${section.presentationKey}' not found in registry.`,
            severity: 'error'
        });
        return errors; // Cannot continue validation without preset
    }

    // 2. Check Signature Compatibility
    if (!matchesSignature(section.binding, preset.signature)) {
        errors.push({
            sectionId: id,
            message: `Binding incompatibility: Section binds to '${section.binding.kind}' but preset '${section.presentationKey}' expects '${preset.signature.kind}'.`,
            severity: 'error'
        });
    }

    // 3. Check Versioning Convention
    if (!VERSION_REGEX.test(section.presentationKey)) {
        errors.push({
            sectionId: id,
            message: `Presentation Key '${section.presentationKey}' does not follow the '.vN' versioning suffix convention.`,
            severity: 'warning'
        });
    }

    // 4. Check Preset Integrity (Versioning Guard)
    // We only check if the preset has a config.
    if (preset.config) {
        const integrityIssue = validatePresetIntegrity(section.presentationKey, preset.config as ConfigState);
        if (integrityIssue) {
            if (integrityIssue.status === 'version_violation') {
                errors.push({
                    sectionId: id,
                    message: `CRITICAL: Preset '${section.presentationKey}' has been modified relative to the manifest. Locked versions (.vN) are immutable. Increment the version to .v${parseInt(section.presentationKey.split('.v').pop() || '0') + 1} or revert changes.`,
                    severity: 'error'
                });
            } else if (integrityIssue.status === 'mismatch') {
                errors.push({
                    sectionId: id,
                    message: `Preset '${section.presentationKey}' does not match the manifest hash.`,
                    severity: 'warning'
                });
            }
            // 'missing_in_manifest' is ignored here as it's a setup task, not a runtime validation error for the page.
        }
    }

    return errors;
};

export const validatePageTemplate = (template: PageTemplate, registry: PresetRegistry): ValidationError[] => {
    const errors: ValidationError[] = [];

    // 0. Runtime Structure Checks
    if (!template) {
         return [{ sectionId: 'PAGE_ROOT', message: 'Template is null or undefined.', severity: 'error' }];
    }
    
    if (!template.pageContext || !template.pageContext.kind) {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: 'Missing required field: pageContext.kind.',
            severity: 'error'
        });
    }

    if (!template.pageSubject || !template.pageSubject.target || !template.pageSubject.cardinality) {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: 'Missing or incomplete required object: pageSubject.',
            severity: 'error'
        });
    }

    if (!Array.isArray(template.sections)) {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: 'Missing or invalid field: sections (must be an array).',
            severity: 'error'
        });
    }

    // Stop if critical structure is missing
    if (errors.length > 0) return errors;

    // 1. Check Context Invariant
    if (template.pageContext.kind === 'detail' && template.pageSubject.cardinality !== 'one') {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: `Page Context 'detail' requires Subject Cardinality 'one'. Got '${template.pageSubject.cardinality}'.`,
            severity: 'error'
        });
    }
    if (template.pageContext.kind === 'index' && template.pageSubject.cardinality !== 'many') {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: `Page Context 'index' requires Subject Cardinality 'many'. Got '${template.pageSubject.cardinality}'.`,
            severity: 'error'
        });
    }

    // 2. Check Slot Uniqueness
    // We add safe access checks here in case section structure is partial (though step 3 would catch it)
    const startSections = template.sections.filter(s => s.placement && s.placement.slot === 'start');
    if (startSections.length > 1) {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: `Multiple sections assigned to 'start' slot. Only one Hero allowed.`,
            severity: 'warning'
        });
    }
    
    const endSections = template.sections.filter(s => s.placement && s.placement.slot === 'end');
    if (endSections.length > 1) {
        errors.push({
            sectionId: 'PAGE_ROOT',
            message: `Multiple sections assigned to 'end' slot. Only one CTA allowed.`,
            severity: 'warning'
        });
    }

    // 3. Check Sections
    template.sections.forEach(section => {
        errors.push(...validateSection(section, registry));
    });

    return errors;
};

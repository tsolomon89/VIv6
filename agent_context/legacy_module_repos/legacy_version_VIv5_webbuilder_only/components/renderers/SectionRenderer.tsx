
import React, { useMemo } from 'react';
import { SectionInstance, ConfigState, SceneObject } from '../../types';
import { PRESET_REGISTRY } from '../../presets/registry';
import { SectionFrame } from '../scene/SectionFrame';
import { validateSection } from '../../utils/validation';
import { ValidationNotice } from '../sections/ValidationNotice';
import { resolveBindingData, resolveSectionDimensions, injectBindingData } from '../../utils/resolution';
import { applyOverrides } from '../../utils/overrides';

interface SectionRendererProps {
    section: SectionInstance;
    setRef: (el: HTMLElement | null) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, setRef }) => {
    // 1. Validation
    const errors = useMemo(() => validateSection(section, PRESET_REGISTRY), [section]);
    
    if (errors.length > 0) {
        return <ValidationNotice errors={errors} sectionId={section.id} />;
    }

    // 2. Preset Lookup
    const preset = PRESET_REGISTRY[section.presentationKey];
    // Clone to create a base config 
    const baseConfig = JSON.parse(JSON.stringify(preset.config)) as ConfigState;

    // 3. Apply Overrides (Phase C2)
    // We apply overrides FIRST. This establishes the "User Configuration".
    const effectiveConfig = applyOverrides(baseConfig, section.overrides || {});

    // 4. Data Injection (Phase D1 - Smart Mode)
    // We inject data into effectiveConfig, but check against baseConfig (Preset) 
    // to ensure we don't overwrite manual user edits (overrides).
    const resolvedData = resolveBindingData(section.binding);
    injectBindingData(effectiveConfig, section.binding, resolvedData, baseConfig);

    // 5. Object Synthesis
    const rootObj: SceneObject = {
        ...effectiveConfig,
        id: `synth-${section.id}-root`,
        isExpanded: false
    };
    
    // Ensure ID for children if they were replaced/overridden without IDs
    if (rootObj.children) {
         rootObj.children = rootObj.children.map((c, i) => ({
             ...c,
             id: c.id || `child-${section.id}-${i}`
         }));
    }
    
    const objects = [rootObj];
    
    // 6. Dimension Resolution
    const { height, pinHeight } = resolveSectionDimensions(section, PRESET_REGISTRY);

    // 7. Extract Config for Frame
    const clip = rootObj.clipWithinSection ?? true;
    const className = rootObj.className || "bg-white"; 
    const overscan = rootObj.renderPolicy?.overscanPx ?? 500;

    // 8. Render via SectionFrame (Phase L1)
    return (
        <SectionFrame
            id={section.id}
            height={height}
            pinHeight={pinHeight}
            objects={objects}
            setRef={setRef}
            clip={clip}
            className={className}
            overscanPx={overscan}
        />
    );
};

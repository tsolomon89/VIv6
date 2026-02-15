
import React, { useMemo } from 'react';
import { PageTemplate, SectionInstance } from '../../types';
import { SectionRenderer } from './SectionRenderer';
import { validatePageTemplate } from '../../utils/validation';
import { PRESET_REGISTRY } from '../../presets/registry';
import { ValidationNotice } from '../sections/ValidationNotice';

interface PageRendererProps {
    template: PageTemplate;
    setSectionRef: (id: string, el: HTMLElement | null) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ template, setSectionRef }) => {
    
    // 1. Run Validation to catch duplicates or context mismatches
    const rootErrors = useMemo(() => {
        return validatePageTemplate(template, PRESET_REGISTRY)
            .filter(e => e.sectionId === 'PAGE_ROOT');
    }, [template]);

    // 2. Sort Sections based on Placement Slot and Order
    // Enforce C1: At most one start and one end section
    const sortedSections = useMemo(() => {
        const startSections = template.sections.filter(s => s.placement.slot === 'start');
        const endSections = template.sections.filter(s => s.placement.slot === 'end');
        const freeSections = template.sections
            .filter(s => s.placement.slot === 'free')
            .sort((a, b) => (a.placement.order || 0) - (b.placement.order || 0));

        const result: SectionInstance[] = [];
        
        // Clamp: Only take the first start section (Layout Contract)
        if (startSections.length > 0) {
            result.push(startSections[0]);
        }
        
        // Free sections in middle
        result.push(...freeSections);
        
        // Clamp: Only take the first end section
        if (endSections.length > 0) {
            result.push(endSections[0]);
        }
        
        return result;
    }, [template]);

    return (
        <>
            {rootErrors.length > 0 && (
                <div className="container mx-auto max-w-3xl mt-24 mb-8 z-50 relative pointer-events-auto">
                    <ValidationNotice errors={rootErrors} sectionId="PAGE_ROOT" />
                </div>
            )}

            {sortedSections.map(section => (
                <SectionRenderer 
                    key={section.id}
                    section={section}
                    setRef={(el) => setSectionRef(section.id, el)}
                />
            ))}
        </>
    );
};

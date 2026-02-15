
import { Binding, SceneObject, SectionConfig, SectionInstance, PresetRegistry, ConfigState } from '../types';
import { projects, sliderImages } from '../data';

// Stub resolver to bridge the new data model with existing static data
export interface ResolvedData {
    objects: SceneObject[];
    height: number;
    pinHeight: number;
}

type RelatedBinding = Extract<Binding, { kind: 'related' }>;
type BindingScope = RelatedBinding['scope'];

const applyScope = (items: any[], scope?: BindingScope): any[] => {
    if (!scope) return items;
    
    let result = [...items];

    // 1. Filter
    if (scope.filter) {
        const filters = Object.entries(scope.filter);
        if (filters.length > 0) {
            result = result.filter(item => {
                return filters.every(([k, v]) => item[k] === v);
            });
        }
    }

    // 2. Sort
    if (scope.sort) {
        const field = scope.sort;
        result.sort((a, b) => {
            const valA = a[field] || '';
            const valB = b[field] || '';
            // Basic string comparison for demo
            return valA.toString().localeCompare(valB.toString());
        });
    }

    // 3. Limit
    if (scope.limit && scope.limit > 0) {
        result = result.slice(0, scope.limit);
    }

    return result;
};

export const resolveBindingData = (binding: Binding): any[] => {
    // 1. Handle Self Binding (Stubbed Page Subject)
    if (binding.kind === 'self') {
        return [{
            id: 'self-brand-identity',
            title: 'Superdesign Studio', 
            tileHeading: 'Superdesign®',
            tileSubtitle: 'A digital design studio crafting experiences for the modern web.',
            tileLabel: 'EST. 2024',
            tileTrailing: 'TOKYO',
            category: 'Brand',
            year: '2024',
            description: 'Based in Tokyo, working globally.',
            // Assets
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            textureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            leadingIcon: 'lucide:Zap'
        }];
    }

    // 2. Handle Related Bindings
    if (binding.kind === 'related') {
        let rawData: any[] = [];

        if (binding.target === 'product') {
            // Use sliderImages for product/marquee demos
            rawData = sliderImages.map((src, i) => ({
                id: `prod-${i}`,
                textureUrl: src,
                // Basic metadata
                tileHeading: `Product ${i + 1}`,
                tileSubtitle: 'Collection 2024',
                category: 'Product'
            }));
        } else if (binding.target === 'feature') {
            // Use projects mock for features/grid
            rawData = projects.map((p, i) => ({
                id: `item-${i}`,
                tileHeading: p.title,
                tileSubtitle: p.category,
                tileTrailing: p.year,
                textureUrl: p.image,
                cardMediaSrc: p.image,
                // Fields for sorting
                title: p.title,
                year: p.year,
                category: p.category
            }));
        } else if (binding.target === 'useCase') {
            rawData = [
                { tileHeading: 'Blob', leadingIcon: 'lucide:Circle', title: 'Blob' },
                { tileHeading: 'Yallo!', leadingIcon: 'lucide:Hexagon', title: 'Yallo!' },
                { tileHeading: 'Bliss+', leadingIcon: 'lucide:Square', title: 'Bliss+' },
                { tileHeading: 'Flea', leadingIcon: 'lucide:Triangle', title: 'Flea' }
            ];
        } else if (binding.target === 'solution') {
            rawData = [
                { 
                    leadingIcon: 'lucide:Hexagon', 
                    tileHeading: 'Brand Identity', 
                    tileSubtitle: 'Crafting distinct visual languages that resonate with your audience and stand the test of time.',
                    title: 'Brand Identity'
                },
                { 
                    leadingIcon: 'lucide:Square', 
                    tileHeading: 'Digital Products', 
                    tileSubtitle: 'Building robust, scalable web applications with cutting-edge technologies and seamless UX.',
                    title: 'Digital Products'
                },
                { 
                    leadingIcon: 'lucide:Triangle', 
                    tileHeading: 'Motion Design', 
                    tileSubtitle: 'Bringing static interfaces to life with fluid animations and interactive 3D experiences.',
                    title: 'Motion Design'
                }
            ];
        } else if (binding.cardinality === 'many') {
            // Default mock for generic 'many'
            rawData = Array.from({ length: 6 }).map((_, i) => ({
                id: `gen-${i}`,
                tileHeading: `Item ${i + 1}`,
                tileSubtitle: 'Generated Content',
                title: `Item ${i + 1}`
            }));
        }

        return applyScope(rawData, binding.scope);
    }

    return [];
};

// Recursive helper to inject resolved binding data into a scene config
export const injectBindingData = (obj: any, binding: Binding, dataItems: any[], original?: any) => {
    const primaryItem = dataItems[0];

    // 1. List Injection (Collection Mode)
    if (obj.shape === 'list') {
        // Strict Override Check: Only inject if listItems is reference-equal to original (Preset)
        // If the user supplied overrides, applyOverrides() would have replaced the array, changing reference.
        // If original is undefined (newly created object), we assume it's clean and safe to inject.
        const isUntouched = !original || (obj.listItems === original.listItems);
        
        if (isUntouched && dataItems.length > 0) {
            obj.listItems = dataItems;
            
            // Ensure list template exists
            if (!obj.listTemplate) {
                obj.listTemplate = { shape: 'card' };
            }
        }
    }
    // 2. Single Item Injection (Hero/Detail Mode)
    // We only inject if the current value matches the Preset Default
    else if ((obj.shape === 'tile' || obj.shape === 'card') && primaryItem) {
        
        const tryInject = (key: string, dataKey: string, fallbackDataKey?: string) => {
            const current = obj[key];
            const defaultVal = original ? original[key] : undefined;
            
            // If current value is essentially "untouched" (equals default, or empty/undefined)
            // AND we have data for it, we inject.
            if (current === defaultVal || current === undefined || current === '') {
                const val = primaryItem[dataKey] || (fallbackDataKey ? primaryItem[fallbackDataKey] : undefined);
                if (val) obj[key] = val;
            }
        };

        tryInject('tileHeading', 'tileHeading');
        tryInject('tileSubtitle', 'tileSubtitle', 'description');
        tryInject('tileLabel', 'tileLabel');
        tryInject('tileTrailing', 'tileTrailing');
        
        // Media Injection (Texture/Image)
        if (obj.textureUrl === (original?.textureUrl) || !obj.textureUrl) {
            if (primaryItem.textureUrl) obj.textureUrl = primaryItem.textureUrl;
            else if (primaryItem.image) obj.textureUrl = primaryItem.image;
        }
        
        // Leading Icon
        if (obj.leadingIcon === (original?.leadingIcon) || !obj.leadingIcon) {
             if (primaryItem.leadingIcon) obj.leadingIcon = primaryItem.leadingIcon;
        }
    }
    
    // Recurse children
    if (obj.children) {
        obj.children.forEach((child: any) => {
            // Attempt to find matching original child for comparison
            const originalChild = original?.children?.find((c: any) => c.id === child.id);
            injectBindingData(child, binding, dataItems, originalChild);
        });
    }
};

export const getSectionLabel = (section: SectionInstance): string => {
    const bindingLabel = section.binding.kind === 'self' 
        ? 'Self' 
        : `Related (${section.binding.target})`;
        
    const slotLabel = section.placement.slot === 'start' 
        ? 'Hero' 
        : section.placement.slot === 'end' 
            ? 'CTA' 
            : 'Section';

    return `${slotLabel} • ${bindingLabel}`;
};

export const resolveSectionDimensions = (section: SectionInstance, registry: PresetRegistry): { height: number, pinHeight: number } => {
    const preset = registry[section.presentationKey];
    
    // Default Fallbacks
    let height = 1000;
    let pinHeight = 800;

    // 1. Preset Values
    if (preset && preset.config) {
        if (preset.config.height?.value) height = preset.config.height.value;
        if (preset.config.pinHeight) pinHeight = preset.config.pinHeight;
    }

    // 2. Overrides
    if (section.overrides) {
        if (section.overrides.height?.value) height = section.overrides.height.value;
        if (section.overrides.pinHeight) pinHeight = section.overrides.pinHeight;
    }

    return { height, pinHeight };
};

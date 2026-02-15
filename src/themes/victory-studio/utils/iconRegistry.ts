
import { 
    Box, Circle, Triangle, Hexagon, Sparkles, Cloud, Zap, 
    Check, CheckCircle, ArrowRight, ArrowUpRight, Square,
    Menu, X, Power, Copy, Monitor, Image as ImageIcon, Type,
    CloudLightning, Trash2, PanelTop, Settings2, MoveVertical, Layers,
    Link2, Unlink, ArrowLeft
} from 'lucide-react';
import React from 'react';

// 1. Package Icons (Lucide)
const PACKAGE_ICONS: Record<string, any> = {
    'Circle': Circle,
    'Hexagon': Hexagon,
    'Square': Square,
    'Triangle': Triangle,
    'Box': Box,
    'Sparkles': Sparkles,
    'Cloud': Cloud,
    'Zap': Zap,
    'Check': Check,
    'CheckCircle': CheckCircle,
    'ArrowRight': ArrowRight,
    'ArrowUpRight': ArrowUpRight,
    'Menu': Menu,
    'X': X,
    'Power': Power,
    'Settings2': Settings2,
    'Layers': Layers,
    'Monitor': Monitor,
    'Trash2': Trash2,
    'Copy': Copy,
    'Link2': Link2,
    'Unlink': Unlink,
    'ArrowLeft': ArrowLeft,
    'Image': ImageIcon,
    'Type': Type,
    'CloudLightning': CloudLightning,
    'PanelTop': PanelTop,
    'MoveVertical': MoveVertical
};

// 2. Repo Icons (Auto-discovery)
// We wrap in try-catch because in some dev environments (like native ES modules in browser),
// import.meta.glob is not available/replaced and will throw a TypeError.
let REPO_ICONS: Record<string, any> = {};
try {
    // @ts-ignore - Vite macro
    REPO_ICONS = import.meta.glob('/src/assets/icons/*.svg', { as: 'url', eager: true });
} catch (e) {
    console.warn('Repo icon auto-discovery not supported in this environment.');
}

// 3. Unified Registry
export interface IconEntry {
    id: string;
    label: string;
    source: 'package' | 'repo';
    render: (props: { className?: string, style?: React.CSSProperties }) => React.ReactNode;
}

const REGISTRY: Record<string, IconEntry> = {};

// Register Package Icons
Object.keys(PACKAGE_ICONS).forEach(key => {
    const Component = PACKAGE_ICONS[key];
    const id = `lucide:${key}`;
    REGISTRY[id] = {
        id,
        label: key,
        source: 'package',
        render: (props) => React.createElement(Component, props)
    };
});

// Register Repo Icons
if (REPO_ICONS) {
    Object.keys(REPO_ICONS).forEach(path => {
        // Extract filename: /src/assets/icons/my-icon.svg -> my-icon
        const filename = path.split('/').pop()?.replace('.svg', '') || 'unknown';
        const src = REPO_ICONS[path]; 
        const id = `repo:${filename}`;
        
        REGISTRY[id] = {
            id,
            label: filename,
            source: 'repo',
            render: (props) => React.createElement('img', { 
                src: src as string, 
                alt: filename,
                ...props 
            })
        };
    });
}

// 4. Public API
export const getIcon = (id: string | undefined) => {
    if (!id) return undefined;
    // Smart lookup: if direct match fail, try adding 'lucide:' prefix for backward compat
    if (REGISTRY[id]) return REGISTRY[id];
    if (REGISTRY[`lucide:${id}`]) return REGISTRY[`lucide:${id}`];
    return undefined;
};

export const getIconList = () => {
    return Object.values(REGISTRY).sort((a, b) => a.id.localeCompare(b.id));
};

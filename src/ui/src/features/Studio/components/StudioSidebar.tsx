
import { NavLink } from 'react-router-dom';
import { useBrand } from '../../../lib/BrandContext';
import {
    ChevronsUpDown, Box, type LucideIcon, Briefcase, Hammer, Play, Pause, CheckSquare, Clock,
    // Icons for object_category and object_def
    Users, Palette, TrendingUp, Settings, Building2, DollarSign, Package, Activity, Target,
    Layers, CreditCard, Megaphone, Folder, FileText, GitBranch, GitMerge, Shield, UserCircle,
    Eye, Calculator, BarChart, Zap, Monitor, User, Server
} from 'lucide-react';
import { BUILDER_NAV_ITEMS } from '../config/studio-config';
import { useEffect, useState, useMemo } from 'react';
import { api, type Entity, type DimensionValue } from '../../../lib/api';
import { useActivityTimer } from '../context/ActivityTimerContext';

interface NavItem {
    route: string;
    icon: LucideIcon;
    name: string;
}

interface CategoryMeta {
    slug: string;
    name: string;
    icon: LucideIcon;
    order: number;
}

type SidebarMode = 'workspace' | 'builder';

// Map icon string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
    'users': Users,
    'user': User,
    'user-circle': UserCircle,
    'palette': Palette,
    'trending-up': TrendingUp,
    'settings': Settings,
    'box': Box,
    'building': Building2,
    'dollar-sign': DollarSign,
    'package': Package,
    'activity': Activity,
    'target': Target,
    'layers': Layers,
    'credit-card': CreditCard,
    'megaphone': Megaphone,
    'folder': Folder,
    'file': FileText,
    'git-branch': GitBranch,
    'git-merge': GitMerge,
    'shield': Shield,
    'eye': Eye,
    'calculator': Calculator,
    'bar-chart': BarChart,
    'zap': Zap,
    'monitor': Monitor,
    'server': Server,
};

function getIcon(iconName: string | undefined): LucideIcon {
    if (!iconName) return Box;
    return ICON_MAP[iconName] || Box;
}

function pluralize(name: string): string {
    // Simple pluralization - handles most common cases
    if (name.endsWith('y')) return name.slice(0, -1) + 'ies';
    if (name.endsWith('s') || name.endsWith('x') || name.endsWith('ch') || name.endsWith('sh')) return name + 'es';
    return name + 's';
}

export function StudioSidebar() {
    const { brands, activeBrandId, setActiveBrandId, isLoading } = useBrand();
    const [mode, setMode] = useState<SidebarMode>('workspace');
    const [categories, setCategories] = useState<CategoryMeta[]>([]);
    const [objectDefs, setObjectDefs] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories and object definitions
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch both in parallel
                const [categoryValues, definitions] = await Promise.all([
                    api.listDimensionValues('object_category').catch(() => [] as DimensionValue[]),
                    api.listEntities('object_def').catch(() => [] as Entity[])
                ]);

                // Transform category dimension values to CategoryMeta
                const categoryMetas: CategoryMeta[] = categoryValues.map(cat => ({
                    slug: cat.slug,
                    name: cat.label,
                    icon: getIcon((cat.metadata as { icon?: string })?.icon),
                    order: (cat.metadata as { order?: number })?.order ?? 99
                }));

                // Sort by order
                categoryMetas.sort((a, b) => a.order - b.order);

                setCategories(categoryMetas);
                setObjectDefs(definitions);
            } catch (err) {
                console.warn('Failed to load sidebar data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Build dynamic nav items from object_defs grouped by category
    const dynamicWorkspaceItems = useMemo(() => {
        const navItems: Record<string, NavItem[]> = {};

        // Initialize with empty arrays for each category in order
        for (const cat of categories) {
            navItems[cat.name] = [];
        }

        // Group object_defs by category
        for (const def of objectDefs) {
            const categorySlug = (def.data as { category?: string })?.category;
            const iconName = (def.data as { icon?: string })?.icon;

            // Skip system objects (is_system: true) in workspace mode - they belong in builder
            const isSystem = (def.data as { is_system?: boolean })?.is_system;
            if (isSystem) continue;

            // Find the category name from our categories list
            const category = categories.find(c => c.slug === categorySlug);
            const categoryName = category?.name || 'Custom';

            // Ensure the category exists in navItems
            if (!navItems[categoryName]) {
                navItems[categoryName] = [];
            }

            navItems[categoryName].push({
                route: `/records/${def.slug}`,
                icon: getIcon(iconName),
                name: pluralize(def.name)
            });
        }

        // Remove empty categories (except 'Custom' if we want to show it always)
        const result: Record<string, NavItem[]> = {};
        for (const [name, items] of Object.entries(navItems)) {
            if (items.length > 0) {
                result[name] = items;
            }
        }

        return result;
    }, [categories, objectDefs]);

    const currentNavItems = mode === 'workspace' ? dynamicWorkspaceItems : BUILDER_NAV_ITEMS;

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-800 space-y-4">
                <h1 className="text-xl font-bold text-white">Studio</h1>

                {/* Brand Switcher */}
                <div className="relative group">
                    <select
                        className="w-full appearance-none bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        value={activeBrandId || ''}
                        onChange={(e) => setActiveBrandId(e.target.value)}
                        disabled={isLoading}
                    >
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <ChevronsUpDown size={12} className="absolute right-2 top-2 text-zinc-500 pointer-events-none" />
                </div>

                {/* Mode Switcher */}
                <div className="flex p-1 bg-zinc-800 rounded-lg">
                    <button
                        onClick={() => setMode('workspace')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                            mode === 'workspace'
                                ? 'bg-zinc-700 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Briefcase size={14} />
                        Workspace
                    </button>
                    <button
                        onClick={() => setMode('builder')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                            mode === 'builder'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Hammer size={14} />
                        Builder
                    </button>
                </div>
            </div>

            <nav className="flex-1 p-2 overflow-y-auto">
                {loading && mode === 'workspace' ? (
                    <div className="px-3 py-8 text-center text-zinc-500 text-sm">
                        Loading...
                    </div>
                ) : (
                    Object.entries(currentNavItems).map(([group, items]) => (
                        <div key={group || 'default'} className="mb-6">
                            {group && (
                                <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    {group}
                                </h3>
                            )}
                            {items.map(item => (
                                <NavLink
                                    key={item.route}
                                    to={item.route}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-0.5 ${
                                            isActive
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                        }`
                                    }
                                >
                                    <item.icon size={18} />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))
                )}
            </nav>

            {/* Mode Indicator Footer */}
            <div className={`p-3 text-xs text-center border-t border-zinc-800 ${mode === 'builder' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                {mode === 'builder' ? 'Configuration Mode' : 'Operational Mode'}
            </div>

            {/* Activity Timer Widget */}
            <ActivityTimerWidget />
        </aside>
    );
}



function ActivityTimerWidget() {
    const { activeActivity, status, elapsedSeconds, pause, resume, complete } = useActivityTimer();

    if (!activeActivity) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
                    <Clock size={12} />
                    <span>Current Activity</span>
                </div>
                <div className="font-mono text-sm font-bold text-white">
                    {formatTime(elapsedSeconds)}
                </div>
            </div>

            <div className="text-sm font-medium text-white truncate mb-3" title={activeActivity.name}>
                {activeActivity.name}
            </div>

            <div className="flex items-center gap-2">
                {status === 'tracking' ? (
                    <button
                        onClick={() => pause()}
                        className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded transition-colors"
                    >
                        <Pause size={12} />
                        Pause
                    </button>
                ) : (
                    <button
                        onClick={() => resume()}
                        className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
                    >
                        <Play size={12} />
                        Resume
                    </button>
                )}

                <button
                    onClick={() => complete()}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                >
                    <CheckSquare size={12} />
                    Done
                </button>
            </div>
        </div>
    );
}

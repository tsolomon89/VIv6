
import { NavLink } from 'react-router-dom';
import { useBrand } from '../../../lib/BrandContext';
import { ChevronsUpDown, Box, type LucideIcon, Briefcase, Hammer, Play, Pause, CheckSquare, Clock } from 'lucide-react';
import { WORKSPACE_NAV_ITEMS, BUILDER_NAV_ITEMS } from '../config/studio-config';
import { useEffect, useState } from 'react';
import { api, type Entity } from '../../../lib/api';
import { useActivityTimer } from '../context/ActivityTimerContext';

interface NavItem {
    route: string;
    icon: LucideIcon;
    name: string;
}

type SidebarMode = 'workspace' | 'builder';

export function StudioSidebar() {
  const { brands, activeBrandId, setActiveBrandId, isLoading } = useBrand();
  const [mode, setMode] = useState<SidebarMode>('workspace');
  const [dynamicWorkspaceItems, setDynamicWorkspaceItems] = useState<Record<string, NavItem[]>>(WORKSPACE_NAV_ITEMS);

  useEffect(() => {
      // Dynamic Taxonomy Generation
      // Fetch 'object_def' records which represent the Tier 1 Schema
      
      api.listEntities('object_def').then(definitions => {
          if (!definitions || definitions.length === 0) return;
          
          const dynamicNav = { ...WORKSPACE_NAV_ITEMS };
          const customGroup: NavItem[] = [];

          // Helper to check if a route exists in any group (in either mode, to be safe, but primarily workspace)
          const routeExists = (route: string) => {
              for (const group of Object.values(dynamicNav)) {
                  if (group.some(item => item.route === route)) return true;
              }
              return false;
          };
          
          definitions.forEach((def: Entity) => {
              const route = `/records/${def.slug}`;
              
              // If this definition is NOT already in our hardcoded config, add it to Custom
              if (!routeExists(route)) {
                  customGroup.push({
                      route: route,
                      icon: Box, // Default icon
                      name: def.name
                  });
              }
          });

          // Add 'CUSTOM' group if we found any new types
          if (customGroup.length > 0) {
            // @ts-ignore - dynamic key assignment
            dynamicNav['CUSTOM'] = customGroup;
          }
          
          setDynamicWorkspaceItems(dynamicNav);
      }).catch(() => {
          // Silent failure
      });
  }, []);

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
        {Object.entries(currentNavItems).map(([group, items]) => (
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
        ))}
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

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, Link2, FileCode, Globe, Layers, Hammer } from 'lucide-react';

const navItems = [
  { group: 'Manage', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sites', icon: Globe, label: 'Sites & Domains' },
    { to: '/entities', icon: Database, label: 'Content Database' },
    { to: '/relationships', icon: Link2, label: 'Relationships' },
    { to: '/dimensions', icon: Layers, label: 'Dimensions' },
  ]},
  { group: 'Design System', items: [
    { to: '/templates', icon: FileCode, label: 'Templates' },
    { to: '/editor', icon: LayoutDashboard, label: 'Visual Editor' },
  ]},
  { group: 'System', items: [
    { to: '/builds', icon: Hammer, label: 'Builds' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]}
];

import { useBrand } from '../../lib/BrandContext';
import { ChevronsUpDown } from 'lucide-react';

export function Sidebar() {
  const { brands, activeBrandId, setActiveBrandId, isLoading } = useBrand();

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white mb-2">VI Studio</h1>
        
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
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((group) => (
          <div key={group.group} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {group.group}
            </h3>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

import { useState, useEffect, useRef } from 'react';
import { api, type Entity } from '../lib/api';
import { Search, X, Check, ChevronsUpDown } from 'lucide-react';

interface RefPickerProps {
    value: string | null;
    onChange: (value: string | null) => void;
    targetType: string;
    disabled?: boolean;
    placeholder?: string;
}

export function RefPicker({ value, onChange, targetType, disabled, placeholder }: RefPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<Entity | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load initial selected item if value exists
    useEffect(() => {
        if (value && !selectedItem) {
            api.getEntity(value).then(setSelectedItem).catch(console.error);
        } else if (!value) {
            setSelectedItem(null);
        }
    }, [value]);

    // Load options when opening
    useEffect(() => {
        if (isOpen && options.length === 0) {
            setLoading(true);
            api.listEntities(targetType)
                .then(setOptions)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, targetType]);

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(search.toLowerCase()) || 
        opt.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white flex items-center justify-between cursor-pointer transition-colors
                    ${disabled ? 'opacity-50 cursor-not-allowed border-zinc-700' : 'border-zinc-700 hover:border-zinc-600 focus:ring-2 focus:ring-indigo-500/50'}
                    ${isOpen ? 'ring-2 ring-indigo-500/50 border-indigo-500' : ''}
                `}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedItem ? (
                        <span className="truncate text-zinc-200">
                            {selectedItem.name} 
                            <span className="text-zinc-500 ml-2 text-xs">({selectedItem.slug})</span>
                        </span>
                    ) : (
                        <span className="text-zinc-500">{placeholder || `Select ${targetType}...`}</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {value && !disabled && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                                setSearch('');
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded-full hover:bg-zinc-700"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronsUpDown size={14} className="text-zinc-500" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-60 flex flex-col">
                    <div className="p-2 border-b border-zinc-800">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-8 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                                placeholder="Search..."
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {loading ? (
                            <div className="p-4 text-center text-zinc-500 text-sm">Loading...</div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 text-sm">No results found</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setSelectedItem(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between group
                                        ${value === opt.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-300 hover:bg-zinc-800'}
                                    `}
                                >
                                    <div>
                                        <div className="font-medium">{opt.name}</div>
                                        <div className="text-xs text-zinc-600 group-hover:text-zinc-500">{opt.slug}</div>
                                    </div>
                                    {value === opt.id && <Check size={14} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

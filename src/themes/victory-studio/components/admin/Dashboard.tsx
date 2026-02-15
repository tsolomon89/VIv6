import React, { useState, useEffect } from 'react';
import { EntitySchemas, EntityType } from '../../../../core/schema/definitions';
import { SchemaForm } from './systems/SchemaForm';
import { apiClient, Entity } from '../../api/client';
import { Folder, Database, Layout as LayoutIcon, FileText, Plus, Trash2, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pages' | 'data'>('pages');
    const [entities, setEntities] = useState<Entity[]>([]);
    const [brands, setBrands] = useState<Entity[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    
    // Schema Form State
    const [isCreating, setIsCreating] = useState<EntityType | null>(null);
    const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
    const [highlightField, setHighlightField] = useState<string | null>(null);

    // 1. Load Brands on Mount
    useEffect(() => {
        loadBrands();
    }, []);

    // 2. Load Content when Brand selection changes or Tab changes
    useEffect(() => {
        if (selectedBrandId) {
            loadContent(selectedBrandId);
        } else {
            setEntities([]);
        }
    }, [selectedBrandId, activeTab]);

    // 3. Deep Linking: Check for ?editId= query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('editId');
        const field = params.get('field');
        if (editId && entities.length > 0) {
            const target = entities.find(e => e.id === editId);
            if (target) {
                setEditingEntity(target);
                if (field) setHighlightField(field);
            }
        }
    }, [entities]); // Run when entities are loaded

    const loadBrands = async () => {
        try {
            const data = await apiClient.listEntities('brand');
            setBrands(data);
            if (data.length > 0) {
                setSelectedBrandId(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load brands:", error);
        }
    };

    const loadContent = async (brandId: string) => {
        try {
            setLoading(true);
            // If activeTab is 'pages', fetch pages.
            // If activeTab is 'data', fetch everything ELSE (product, feature, etc)
            // But listEntities API filters by *single* type... or all?
            // Our listEntities implementation: listEntities(type?, brandId?)
            // If we leverage the API to return ALL for brand, we filter client side.
            const allData = await apiClient.listEntities(undefined, brandId);
            
            if (activeTab === 'pages') {
                setEntities(allData.filter(e => e.type === 'page'));
            } else {
                setEntities(allData.filter(e => e.type !== 'page' && e.type !== 'brand'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        await apiClient.deleteEntity(id);
        if (selectedBrandId) loadContent(selectedBrandId);
    };

    const handleCreateSchemaEntity = async (data: any) => {
        if (!isCreating || !selectedBrandId) return;
        
        // Auto-generate slug from name if not provided or valid?
        // Zod validates format, but we might want to auto-slugify for UX if user typed generic name
        // The SchemaForm handles raw input.
        // We'll trust the user input passed validation.
        
        try {
            await apiClient.createEntity({
                ...data, // includes name, slug, description, type, data
                type: isCreating,
                brand_id: selectedBrandId
            });
            setIsCreating(null);
            loadContent(selectedBrandId);
        } catch (e) {
            alert("Failed to create entity: " + e);
        }
    };
    
    const handleUpdateEntity = async (data: any) => {
        if (!editingEntity) return;
        try {
            await apiClient.updateEntity(editingEntity.id, data);
            setEditingEntity(null);
            loadContent(selectedBrandId);
        } catch (e) {
             alert("Failed to update entity: " + e);
        }
    };


    const handleCreatePage = async () => {
        if (!selectedBrandId) {
            alert("Please select a brand first.");
            return;
        }

        // Auto-generate name for smoother testing/UX
        const name = `Page ${new Date().toLocaleTimeString()}`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        await apiClient.createEntity({
            type: 'page',
            name,
            slug,
            brand_id: selectedBrandId, // Scope to selected brand
            data: { 
                schemaVersion: 1,
                pageContext: { kind: 'detail' },
                pageSubject: { target: 'brand', cardinality: 'one' },
                sections: []
            } as any
        });
        loadContent(selectedBrandId);
    };

    const handleCreateBrand = async () => {
        const name = prompt("Brand Domain (e.g. 'acme.com'):");
        if(!name) return;
        
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await apiClient.createEntity({
            type: 'brand',
            name,
            slug,
            data: { 
                // schema-less creation for brand mostly, or use schema?
                // keeping simple prompt for now
            } as any
        });
        loadBrands();
    };

    return (
        <div className="p-8 bg-neutral-900 min-h-screen text-white relative">
            {/* Modal for Creating/Editing */}
            {(isCreating || editingEntity) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <SchemaForm 
                        title={isCreating ? `New ${isCreating}` : `Edit ${editingEntity?.name}`}
                        schema={isCreating ? EntitySchemas[isCreating] : EntitySchemas[editingEntity!.type as EntityType]}
                        defaultValues={editingEntity}
                        onSubmit={isCreating ? handleCreateSchemaEntity : handleUpdateEntity}
                        onCancel={() => { setIsCreating(null); setEditingEntity(null); setHighlightField(null); }}
                        highlightField={highlightField || undefined}
                    />
                </div>
            )}
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <LayoutIcon className="w-8 h-8 text-blue-500" />
                        Victory Studio
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <button 
                            onClick={() => setActiveTab('pages')} 
                            className={`text-sm font-medium pb-1 border-b-2 transition ${activeTab === 'pages' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
                        >
                            Pages
                        </button>
                        <button 
                            onClick={() => setActiveTab('data')} 
                            className={`text-sm font-medium pb-1 border-b-2 transition ${activeTab === 'data' ? 'text-white border-purple-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
                        >
                            Data Graph
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Brand Selector */}
                    <div className="flex items-center gap-2 bg-neutral-800 p-1 pr-3 rounded-lg border border-neutral-700">
                        <div className="p-2 bg-neutral-700 rounded text-neutral-300">
                             <LayoutIcon className="w-4 h-4" />
                        </div>
                        <select 
                            value={selectedBrandId} 
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium min-w-[150px] cursor-pointer"
                        >
                            {brands.length === 0 && <option value="">No Brands</option>}
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleCreateBrand}
                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                        title="New Brand"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    
                    <div className="h-8 w-px bg-neutral-800 mx-2"></div>
                    
                    {/* Action Button Changes Based on Tab */}
                    {activeTab === 'pages' ? (
                        <button 
                            onClick={handleCreatePage}
                            disabled={!selectedBrandId}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Plus className="w-4 h-4" /> New Page
                        </button>
                    ) : (
                        <div className="relative group">
                            <button className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                <Plus className="w-4 h-4" /> Add Entity
                            </button>
                            {/* Dropdown for Entity Types */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-20">
                                {['product', 'feature', 'solution', 'useCase', 'persona'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setIsCreating(type as EntityType)}
                                        className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white capitalize"
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="text-center text-neutral-500 py-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entities.map(entity => (
                        <div key={entity.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 hover:border-neutral-500 transition group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${entity.type === 'brand' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {entity.type === 'brand' ? <LayoutIcon className="w-5 h-5"/> : (
                                        activeTab === 'data' ? <Database className="w-5 h-5 text-purple-400"/> : <FileText className="w-5 h-5"/>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    {activeTab === 'data' && (
                                        <button 
                                            onClick={() => setEditingEntity(entity)}
                                            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg"
                                        >
                                            <Database className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(entity.id)}
                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-1">{entity.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-neutral-500 font-mono mb-6">
                                <span className="uppercase">{entity.type}</span>
                                <span>•</span>
                                <span>/{entity.slug}</span>
                            </div>

                            {activeTab === 'pages' ? (
                                <a 
                                    href={`/?id=${entity.id}`} 
                                    className="block w-full text-center bg-neutral-700 hover:bg-neutral-600 py-2 rounded-lg font-medium transition"
                                >
                                    Open Editor
                                </a>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    {/* Data Preview */}
                                    {Object.entries(entity.data || {}).slice(0, 3).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                            <span className="text-neutral-500">{k}</span>
                                            <span className="text-neutral-300 truncate max-w-[100px]">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {entities.length === 0 && (
                        <div className="col-span-full text-center py-20 text-neutral-500 bg-neutral-800/50 rounded-xl border border-dashed border-neutral-700">
                            {selectedBrandId ? `No ${activeTab} found for this brand.` : "Select a brand to view content."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

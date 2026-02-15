
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type Entity } from '../../../lib/api';
import { getConfigFromSchema } from '../config/studio-config';
import { RecordDetailHeader } from '../components/RecordDetailHeader';
import { RecordCardGrid } from '../components/RecordCardGrid';
import { ContextSidebar } from '../components/ContextSidebar';
import { ArrowLeft, Edit2, Sidebar as SidebarIcon } from 'lucide-react';

export function RecordDetailView() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';
    
    // State
    const [entity, setEntity] = useState<Entity | null>(null);
    const [formState, setFormState] = useState<Entity | null>(null); // Duplicate for editing
    const [definition, setDefinition] = useState<Entity | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(isNew);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Initial Fetch
    useEffect(() => {
        if (!type || !id) return;
        
        setError(null);

        const fetchDef = api.listEntities('object_def').then(defs => defs.find((d: any) => d.slug === type));

        if (isNew) {
            fetchDef.then(def => {
                setDefinition(def);
                setEntity({ type, data: {} } as any); // Abstract empty entity
                setFormState({ type, data: {} } as any);
                setIsEditing(true);
                setIsLoading(false);
            });
            return;
        }

        setIsLoading(true);
        Promise.all([
            api.getEntity(id),
            fetchDef
        ]).then(([data, def]) => {
                if (data.type !== type) throw new Error(`Type mismatch`);
                setEntity(data);
                setFormState(JSON.parse(JSON.stringify(data))); // Deep copy
                setDefinition(def);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load record');
            })
            .finally(() => setIsLoading(false));
    }, [type, id, isNew]);

    // Algo 2: Automated Account Resolution
    const handleFieldChange = (field: string, value: any) => {
        if (!formState) return;
        
        const nextState = { ...formState, data: { ...formState.data, [field]: value } }; // Flat data structure for now? 
        // Note: The UI components expect 'entity' which might be flat or nested 'data'. 
        // 'api.ts' says Entity has 'data: EntityData'. 
        // Current 'getRecordValue' helper handles flattening.
        // We will store flat fields in 'data' dictionary for simplicity during edit, 
        // assuming standard EAV. Or we should match the 'Entity' structure exactly.
        // Let's assume 'data' is a Record<string, any> for this generic editor.
        // BUT api.ts defines EntityData as { fieldGroups... }. 
        // This is a mismatch. Let's look at getRecordValue usage.
        // getRecordValue typically checks root vs data.
        
        // For simple "Algo 2", let's handle the Logic:
        if (field.toLowerCase() === 'email' && value && typeof value === 'string') {
            const domain = value.split('@')[1];
            if (domain) {
                // Background resolution
                api.listEntities('account').then(accounts => {
                    const match = accounts.find((a: any) => {
                        const website = a.data?.Website || a.website || ''; // Handle potential structure variance
                        return website.includes(domain);
                    });
                    if (match) {
                        console.log('Algo 2: Auto-linked Account', match.name);
                        // Auto-set the Account field
                        setFormState(prev => prev ? ({
                            ...prev,
                            data: { ...prev.data, ['Account']: match.id } // Using Name 'Account' as convention
                        }) : null);
                    }
                });
            }
        }

        // Algo 3: Job Title -> Persona Heuristic
        if (field === 'Job Title' && value && typeof value === 'string') {
            const v = value.toLowerCase();
            let persona = '';
            
            if (v.match(/chief|vp|president|head|director|founder|owner|partner/)) {
                persona = 'decision_maker';
            } else if (v.match(/manager|lead|senior|principal/)) {
                persona = 'influencer';
            } else {
                persona = 'end_user';
            }
            
            if (persona) {
               console.log('Algo 3: Auto-classified Persona', persona);
               setFormState(prev => prev ? ({
                    ...prev,
                    data: { ...prev.data, ['Persona']: persona }
                }) : null);
            }
        }

        setFormState(nextState as any);
    };

    const handleSave = async () => {
        if (!formState || !type) return;
        try {
            setIsLoading(true);
            // Construct payload. 
            // In a real app we need to map flat 'data' back to 'fieldGroups' if that's the strict schema.
            // For this iteration, we pass 'data' as is, assuming Backend handles it (or we use simple object storage).
            const payload = { ...formState }; 
            
            if (isNew) {
               const res = await api.createEntity(payload as any);
               navigate(`/records/${type}/${res.id}`);
            } else {
               await api.updateEntity(id || '', payload as any);
               setEntity(payload);
               setIsEditing(false);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to save');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-zinc-400">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!type) return <div className="p-8 text-red-400">Invalid Route</div>;

    // Generate cards dynamically from object_def fieldGroups, with fallback to hardcoded config
    const cards = getConfigFromSchema(definition ?? null, type);
    const activeRecord = (isEditing ? formState : entity) as Entity;

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 min-w-0">
                <div className="max-w-7xl mx-auto space-y-6 p-6 pb-20">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                        <Link to={`/records/${type}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                            <span className="capitalize">Back to {type}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                            >
                                <SidebarIcon size={18} />
                            </button>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={() => isNew ? navigate(-1) : setIsEditing(false)} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white">Cancel</button>
                                    <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
                                        Save Record
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                                    <Edit2 size={14} />
                                    Edit Record
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header */}
                    <RecordDetailHeader entity={activeRecord} type={type} />

                    {/* Grid */}
                    {cards.length > 0 ? (
                        <RecordCardGrid 
                            cards={cards} 
                            entity={activeRecord} 
                            definition={definition} 
                            isEditing={isEditing}
                            onChange={handleFieldChange}
                        />
                    ) : (
                         <div className="text-center py-12 text-zinc-500 border border-zinc-800 border-dashed rounded-xl">
                            No cards configured.
                        </div>
                    )}
                </div>
            </div>

            {/* Context Sidebar */}
            <ContextSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} contextRecord={activeRecord} />
        </div>
    );
}

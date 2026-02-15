
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Plus } from 'lucide-react';
import { ContextSidebar } from '../components/ContextSidebar';
import { RecordKanbanBoard } from '../components/RecordKanbanBoard';
import { RecordField } from '../components/RecordField';
import { RECORD_COLUMNS, RECORD_ICON_MAPPING } from '../config/studio-config';

export function RecordListPage() {
    const { type } = useParams<{ type: string }>();
    const [records, setRecords] = useState<any[]>([]);
    const [definition, setDefinition] = useState<any>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const navigate = useNavigate();

    // Fetch Records & Definition
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        if (!type) return;

        Promise.all([
             api.listEntities(type),
             api.listEntities('object_def')
        ]).then(([data, definitions]) => {
            setRecords(data);
            if (definitions) {
                const def = definitions.find((d: any) => d.slug === type);
                setDefinition(def);
            }
        }).catch(err => {
            console.error(err);
            setError('Failed to load records');
        }).finally(() => setIsLoading(false));
    }, [type]);

    // Default to Board for opportunities
    useEffect(() => {
        if (type === 'opportunities') setViewMode('board');
        else setViewMode('list');
    }, [type]);

    const handleUpdateRecord = async (id: string, updates: any) => {
        try {
            const updatedRecord = await api.updateEntity(id, updates);
            // Refresh local state with server response (capture calculated fields like Yield)
            setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updatedRecord, data: { ...r.data, ...updatedRecord.data } } : r));
            // Note: Use deep merge for data in real app
        } catch (e) {
            console.error('Failed to update record', e);
            alert('Failed to update record');
        }
    };

    if (!type) return <div>Invalid Route</div>;

    // Capitalize for title
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    
    // Check if configuration exists
    if (!RECORD_COLUMNS[type]) {
        return (
            <div className="p-8 text-center text-zinc-500">
                <h2 className="text-xl font-bold mb-2">Module "{title}" Not Configured</h2>
                <p>Please add configuration to studio-config.ts</p>
            </div>
        );
    }

    if (isLoading) return <div className="p-8 text-zinc-400">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;

    const columns = RECORD_COLUMNS[type];
    const Icon = RECORD_ICON_MAPPING[type]?.icon;
    const iconColor = RECORD_ICON_MAPPING[type]?.color;

    return (
        <div className="flex min-h-screen">
             {/* Center Content Area */}
            <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                <div className="flex-none p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                    <div>
                        <h1 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
                             {Icon && <Icon size={28} style={{ color: iconColor }} />}
                             {title}
                        </h1>
                         <p className="text-zinc-400 text-sm mt-1">
                            {definition?.summary || `Manage your ${type}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button 
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </button>
                        <button 
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'board' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                            onClick={() => setViewMode('board')}
                        >
                            Board
                        </button>
                    </div>
                    <Link
                        to={`/records/${type}/new`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New {title.slice(0, -1)}
                    </Link>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {viewMode === 'board' ? (
                        <RecordKanbanBoard 
                            records={records} 
                            definition={definition} 
                            groupByField="stage"
                            onRecordClick={(id) => navigate(`/records/${type}/${id}`)}
                            onUpdateRecord={handleUpdateRecord}
                        />
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            {/* Generic Table */}
                             <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-800/50 text-zinc-400 font-medium border-b border-zinc-800">
                                    <tr>
                                        {columns && Object.values(columns).map((col) => (
                                            <th key={col.name} className="px-6 py-3">{col.name}</th>
                                        ))}
                                        {!columns && <th className="px-6 py-3">Name</th>}
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {records.map((record) => (
                                        <tr 
                                            key={record.id} 
                                            className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/records/${type}/${record.id}`)}
                                        >
                                            {columns ? Object.keys(columns).map((key) => (
                                                <td key={key} className="px-6 py-4 text-zinc-300">
                                                    <RecordField entity={record} field={key} definition={definition} />
                                                </td>
                                            )) : (
                                                <td className="px-6 py-4 text-zinc-300">{record.name || (record as any).title || 'Untitled'}</td>
                                            )}
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-zinc-500 hover:text-white transition-colors">View</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={columns ? Object.keys(columns).length + 1 : 2} className="px-6 py-12 text-center text-zinc-500">
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Context Sidebar */}
            <ContextSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
    );
}


import { useEffect, useState } from 'react';
import { api, type Entity } from '../../../lib/api';
import { RECORD_COLUMNS } from '../config/studio-config';
import { Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecordRecordTableProps {
    type: string;
    title: string;
}

export function RecordRecordTable({ type, title }: RecordRecordTableProps) {
    const [records, setRecords] = useState<Entity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const columns = RECORD_COLUMNS[type];

    useEffect(() => {
        async function load() {
            try {
                // api.listEntities filters by type if provided
                const data = await api.listEntities(type);
                setRecords(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load records');
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [type]);

    if (isLoading) return <div className="text-zinc-400">Loading {title}...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    if (!columns) {
        return <div className="text-red-400">Configuration missing for type: {type}</div>
    }

    const columnKeys = Object.keys(columns);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title}</h2>
                <Link 

                    to={`/records/${type}/new`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium"
                >
                    Create {type.slice(0, -1)} {/* simple singularization */}
                </Link>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-800/50 text-zinc-400 uppercase tracking-wider font-medium">
                        <tr>
                            {columnKeys.map(key => (
                                <th key={key} className="px-6 py-4">
                                    {columns[key].name || key}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan={columnKeys.length + 1} className="px-6 py-8 text-center text-zinc-500">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            records.map(record => (
                                <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors">
                                    {columnKeys.map(key => {
                                        let value: any = '';
                                        
                                        // 1. Check root properties (like updated_at)
                                        if (key in record) {
                                            value = (record as any)[key];
                                        } 
                                        // 2. Check data dictionary
                                        else if (record.data && record.data.fieldGroups) {
                                            const allFields = record.data.fieldGroups.flatMap(g => g.fields);
                                            const field = allFields.find(f => f.name === key);
                                            value = field?.value;
                                        } 

                                        return (
                                            <td key={key} className="px-6 py-4 text-zinc-300">
                                                {renderValue(value, key)}
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 text-right">
                                       <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                // Link to new Universal Detail View
                                                to={`/records/${type}/${record.id}`} 
                                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                       </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function renderValue(value: any, _key: string) {
    if (value === null || value === undefined) return <span className="text-zinc-600">-</span>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    // Handle image type from column config if size > 0
    return String(value);
}

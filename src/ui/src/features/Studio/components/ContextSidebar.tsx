
import { Calendar, Plus, UserPlus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, type Entity } from '../../../lib/api';
import { timeAgo, getRecordValue } from '../utils/record-utils';

interface ContextSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    contextRecord?: Entity | null;
}

export function ContextSidebar({ isOpen, onToggle, contextRecord }: ContextSidebarProps) {
    const [activities, setActivities] = useState<Entity[]>([]);

    useEffect(() => {
        if (isOpen) {
            api.listEntities('activity').then(data => {
                let filtered = data || [];
                if (contextRecord) {
                    // Filter activities related to this record
                    filtered = filtered.filter(a => {
                        const relatedType = a.data?.fieldGroups?.find((g: any) => g.fields.some((f: any) => f.name === 'ContextType' && f.value === contextRecord.type));
                        const relatedId = a.data?.fieldGroups?.find((g: any) => g.fields.some((f: any) => f.name === 'ContextId' && f.value === contextRecord.id));
                        
                        // Fallback: Check 'Contact' or 'Account' fields if they match 
                        // This is a loose check based on the schema conventions
                        const groups = a.data?.fieldGroups || [];
                        const hasRef = groups.some((g: any) => g.fields.some((f: any) => f.value === contextRecord.id));
                        
                        return relatedType || relatedId || hasRef;
                    });
                }

                const sorted = filtered.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setActivities(sorted.slice(0, 5));
            }).catch(() => {});
        }
    }, [isOpen, contextRecord]);

    if (!isOpen) return null;

    const addActivityLink = contextRecord 
        ? `/records/activity/new?related_to=${contextRecord.id}&related_type=${contextRecord.type}`
        : "/records/activity/new";

    return (
        <div className="w-80 border-l border-zinc-800 bg-zinc-900/50 hidden xl:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                    Quick Actions
                </h3>
                 <button onClick={onToggle} className="text-zinc-500 hover:text-zinc-300 lg:hidden">
                    <span className="sr-only">Close</span>
                </button>
            </div>
            
            <div className="p-4 space-y-3">
                <Link to={addActivityLink} className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-700 transition-all group text-left">
                    <div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/20">
                        <Plus size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-200">Add Activity</div>
                        <div className="text-xs text-zinc-500">
                            {contextRecord ? `Log regarding ${contextRecord.name || 'record'}` : 'Log a call, meeting, or task'}
                        </div>
                    </div>
                </Link>

                <Link to="/records/activity" className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-700 transition-all group text-left">
                     <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-200">Calendar</div>
                        <div className="text-xs text-zinc-500">View upcoming events</div>
                    </div>
                </Link>

                 <Link to="/records/contact/new" className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-700 transition-all group text-left">
                     <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20">
                        <UserPlus size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-200">Add Contact</div>
                        <div className="text-xs text-zinc-500">Associate new person</div>
                    </div>
                </Link>
            </div>

            <div className="p-4 border-t border-zinc-800 mt-auto">
                 <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-xs mb-4">
                    Recent History
                </h3>
                <div className="space-y-4">
                    {activities.length === 0 && (
                        <div className="text-xs text-zinc-500 italic">No recent activity.</div>
                    )}
                    {activities.map((activity, i) => {
                        const verb = getRecordValue(activity, 'Verb') || 'Acted on';
                        const objectRef = getRecordValue(activity, 'Object');
                        // Object might be a ref string or resolved? Usually generic ref field stores ID.
                        // Assuming it's a string ID or name if inflated. 
                        // Actually, 'Object' in definitions.json was type 'ref'. 
                        // The backend might not resolve it automatically in listEntities unless configured.
                        // For now we just show what we have.
                        
                        return (
                            <div key={activity.id} className="flex gap-3 relative">
                                {/* Line */}
                                {i !== activities.length - 1 && <div className="absolute left-1.5 top-2 bottom-[-1rem] w-px bg-zinc-800"></div>}
                                
                                <div className="w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-900 mt-1.5 shrink-0 z-10" />
                                <div>
                                    <div className="text-sm text-zinc-300">
                                        {verb} <span className="font-medium text-white">{objectRef || 'Object'}</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        <Clock size={10} /> {timeAgo(activity.created_at)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

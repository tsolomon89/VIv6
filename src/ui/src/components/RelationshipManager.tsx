import { useState, useEffect } from 'react';
import { Plus, X, Link2 } from 'lucide-react';
import { api, type Entity, type Relationship } from '../lib/api';
import { useBrand } from '../lib/BrandContext';

interface RelationshipManagerProps {
    entityId: string;
    entityType: string;
    relationships: Relationship[];
    onUpdate: () => void;
}

// Simple rules for relationships based on entity type hierarchy
const REL_RULES: Record<string, { type: string, target: string }[]> = {
    'brand': [{ type: 'offers', target: 'product' }],
    'product': [{ type: 'has_feature', target: 'feature' }],
    'feature': [{ type: 'solves_with', target: 'solution' }],
    'solution': [{ type: 'used_in', target: 'useCase' }],
    'useCase': [{ type: 'targets', target: 'persona' }],
    'user': [{ type: 'has_role', target: 'role' }]
};

export function RelationshipManager({ entityId, entityType, relationships, onUpdate }: RelationshipManagerProps) {
    const { activeBrandId } = useBrand();
    const [availableTargetEntities, setAvailableTargetEntities] = useState<Entity[]>([]);
    const [relatedEntityNames, setRelatedEntityNames] = useState<Record<string, string>>({});
    const [selectedTargetId, setSelectedTargetId] = useState('');
    // Removed unused loadingTargets state
    
    // Quick Create State
    const [isCreating, setIsCreating] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');

    const allowedRules = REL_RULES[entityType] || [];
    // Default to first rule if available
    const activeRule = allowedRules[0]; 

    // Fetch details for linked entities
    useEffect(() => {
        if (!activeRule) return;
        const relevantRels = relationships.filter(r => r.from_id === entityId && r.type === activeRule.type);
        const targetIds = relevantRels.map(r => r.to_id);
        
        if (targetIds.length === 0) return;

        // In a real app we'd have a bulk fetch or dataloader. 
        // For now, parallel fetch individually (not ideal but works for MVP) 
        // or just fetch listEntities filtered by brand and lookup (if they are in brand).
        // Let's assume they are in the brand.
        api.listEntities(activeRule.target, activeBrandId || undefined).then(ents => {
             const nameMap: Record<string, string> = {};
             ents.forEach(e => nameMap[e.id] = e.name);
             setRelatedEntityNames(prev => ({ ...prev, ...nameMap }));
        });
    }, [activeRule, relationships, activeBrandId, entityId]);

    useEffect(() => {
        if (!activeRule) return;

        // List entities of the target type, filtered by ACTIVE BRAND
        api.listEntities(activeRule.target, activeBrandId || undefined)
            .then(ents => {
                // Filter out entities already linked
                const linkedIds = new Set(relationships.map(r => r.to_id));
                const available = ents.filter(e => !linkedIds.has(e.id));
                setAvailableTargetEntities(available);
            });
    }, [activeRule, relationships, activeBrandId]);

    const handleAdd = async () => {
        if (!selectedTargetId || !activeRule) return;
        try {
            await api.createRelationship({
                from_id: entityId,
                to_id: selectedTargetId,
                type: activeRule.type
            });
            setSelectedTargetId('');
            onUpdate();
        } catch (err) {
            alert('Failed to add relationship');
        }
    };

    const handleQuickCreate = async () => {
        if (!newEntityName || !activeRule) return;
        try {
            // 1. Create the new entity stub
            const slug = newEntityName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            const newEntity = await api.createEntity({
                type: activeRule.target,
                name: newEntityName,
                slug: slug,
                description: 'Quick created from relationship manager',
                brand_id: activeBrandId || undefined,
                data: { fieldGroups: [] } // API will likely fill defaults
            });

            // 2. Link it
            await api.createRelationship({
                from_id: entityId,
                to_id: newEntity.id,
                type: activeRule.type
            });

            setIsCreating(false);
            setNewEntityName('');
            onUpdate();
        } catch (err) {
            console.error(err);
            alert('Failed to quick create entity');
        }
    };

    const handleRemove = async (relId: string) => {
        if (!confirm('Remove this relationship?')) return;
        try {
            await api.deleteRelationship(relId);
            onUpdate();
        } catch (err) {
            alert('Failed to remove relationship');
        }
    };

    if (!activeRule) return null;

    // Filter relationships to only show those relevant to this component (outbound)
    const relevantRels = relationships.filter(r => r.from_id === entityId && r.type === activeRule.type);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Link2 size={20} className="text-indigo-400" />
                Related {activeRule.target}s
            </h3>

            {/* List Existing */}
            <div className="space-y-2 mb-6">
                {relevantRels.length === 0 && (
                    <p className="text-zinc-500 text-sm italic">No linked {activeRule.target}s yet.</p>
                )}
                {relevantRels.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 font-mono">
                                {rel.type}
                            </span>
                            <span className="text-zinc-200">
                                {relatedEntityNames[rel.to_id] || 'Loading...'}
                            </span>
                        </div>
                        <button onClick={() => handleRemove(rel.id)} className="text-zinc-500 hover:text-red-400">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New */}
            {!isCreating ? (
                <div className="flex gap-2">
                    <select
                        value={selectedTargetId}
                        onChange={e => setSelectedTargetId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    >
                        <option value="">Select existing {activeRule.target}...</option>
                        {availableTargetEntities.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedTargetId}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
                    >
                        Link
                    </button>
                    <div className="w-px bg-zinc-800 mx-2"></div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                         <Plus size={16} /> New {activeRule.target}
                    </button>
                </div>
            ) : (
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-medium text-white mb-3">Quick Create {activeRule.target}</h4>
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            value={newEntityName}
                            onChange={e => setNewEntityName(e.target.value)}
                            placeholder={`New ${activeRule.target} Name`}
                            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                            onKeyDown={e => e.key === 'Enter' && handleQuickCreate()}
                        />
                        <button
                            onClick={handleQuickCreate}
                            disabled={!newEntityName}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                        >
                            Create & Link
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-2 text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

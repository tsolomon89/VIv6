import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, FolderTree, FileText } from 'lucide-react';
import { api } from '../lib/api';
import type { Entity, Relationship } from '../lib/api';

interface TreeNode {
  entity: Entity;
  children: TreeNode[];
}

export function UseCaseTree() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ents, rels] = await Promise.all([
        api.listEntities('useCase'),
        api.listRelationships(undefined, undefined, 'has_segment'),
      ]);
      setEntities(ents);
      setRelationships(rels);
    } catch (err) {
      console.error('Failed to load use case tree', err);
    } finally {
      setLoading(false);
    }
  };

  // Build tree: entities with no incoming has_segment relationship are roots
  const childIds = new Set(relationships.map(r => r.to_id));
  const parentMap = new Map<string, string[]>(); // parent_id -> child_ids[]
  for (const rel of relationships) {
    const children = parentMap.get(rel.from_id) || [];
    children.push(rel.to_id);
    parentMap.set(rel.from_id, children);
  }

  const buildTree = (entityId: string): TreeNode | null => {
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return null;
    const childEntityIds = parentMap.get(entityId) || [];
    const children = childEntityIds
      .map(id => buildTree(id))
      .filter((n): n is TreeNode => n !== null);
    return { entity, children };
  };

  const roots = entities
    .filter(e => !childIds.has(e.id))
    .map(e => buildTree(e.id))
    .filter((n): n is TreeNode => n !== null);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.entity.id);
    const isSegment = depth > 0;

    return (
      <div key={node.entity.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/50 rounded-lg transition-colors group ${
            isSegment ? 'ml-6' : ''
          }`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggle(node.entity.id)} className="text-zinc-500 hover:text-zinc-300">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[14px]" />
          )}

          {isSegment ? (
            <FileText size={14} className="text-zinc-500" />
          ) : (
            <FolderTree size={14} className="text-indigo-400" />
          )}

          <Link
            to={`/entities/${node.entity.id}`}
            className="flex-1 text-sm text-zinc-200 hover:text-white"
          >
            {node.entity.name}
          </Link>

          <span className={`text-xs px-2 py-0.5 rounded ${
            isSegment
              ? 'bg-zinc-800 text-zinc-500'
              : 'bg-indigo-900/50 text-indigo-300'
          }`}>
            {isSegment ? 'segment' : 'use case'}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="text-zinc-400 text-sm">Loading...</div>;

  if (roots.length === 0) {
    return (
      <div className="text-zinc-500 text-sm py-4 text-center">
        No use cases found. Create useCase entities and link segments with "has_segment" relationships.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {roots.map(node => renderNode(node, 0))}
    </div>
  );
}

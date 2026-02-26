/**
 * ConfigBrowser - Browse and manage all configuration types
 *
 * GTM-style admin interface for viewing/editing system configuration:
 * - Left sidebar: Config type navigation with counts
 * - Main area: List of configs for selected type
 * - Quick actions: Create in workspace, view versions
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Settings,
  Zap,
  Calculator,
  Shield,
  BarChart3,
  Eye,
  GitBranch,
  Footprints,
  Box,
  FileText,
  Layers,
  Activity,
  Heart,
  Lock,
  Users,
  ChevronRight,
  Plus,
  Search,
  History,
  RefreshCw,
  Workflow,
} from 'lucide-react';
import { api, type ConfigTypeSlug, type Entity } from '../lib/api';

// Config type metadata with icons and descriptions
const CONFIG_TYPE_META: Record<ConfigTypeSlug, { icon: typeof Settings; label: string; description: string; category: string }> = {
  rule: { icon: Zap, label: 'Business Rules', description: 'Automation rules triggered by record events', category: 'Automation' },
  derivation: { icon: Calculator, label: 'Computed Fields', description: 'Formula-based calculated fields', category: 'Automation' },
  validation_constraint: { icon: Shield, label: 'Validation Constraints', description: 'Data validation rules for records', category: 'Automation' },
  metric: { icon: BarChart3, label: 'Rollup Metrics', description: 'Aggregation rules across related records', category: 'Automation' },
  view: { icon: Eye, label: 'Data Views', description: 'Query definitions for data retrieval', category: 'Automation' },
  interpreter_pipeline: { icon: Workflow, label: 'Interpreter Pipelines', description: 'Lifecycle stage ordering for record events', category: 'Automation' },
  interpreter_executor_def: { icon: Workflow, label: 'Interpreter Executors', description: 'Executor definitions for lifecycle stage keys', category: 'Automation' },
  workflow: { icon: GitBranch, label: 'Workflows', description: 'Multi-step automation sequences', category: 'Workflows' },
  workflow_step: { icon: Footprints, label: 'Workflow Steps', description: 'Individual steps in workflows', category: 'Workflows' },
  workflow_step_type: { icon: Box, label: 'Step Types', description: 'Step type definitions with handlers', category: 'Workflows' },
  pipeline_stage: { icon: Activity, label: 'Pipeline Stages', description: 'Opportunity stage configurations', category: 'Commercial' },
  object_def: { icon: Layers, label: 'Object Definitions', description: 'Entity schema definitions', category: 'Schema' },
  field_def: { icon: FileText, label: 'Field Definitions', description: 'Field schema definitions', category: 'Schema' },
  field_group: { icon: Layers, label: 'Field Groups', description: 'Field groupings within objects', category: 'Schema' },
  activity_def: { icon: Activity, label: 'Activity Definitions', description: 'Activity type definitions', category: 'Activities' },
  health_config: { icon: Heart, label: 'Health Configuration', description: 'Health/decay settings per entity', category: 'Scoring' },
  access_policy: { icon: Lock, label: 'Access Policies', description: 'Role-based access control rules', category: 'Security' },
  persona: { icon: Users, label: 'Personas', description: 'Buyer persona definitions', category: 'CRM' },
  state_machine: { icon: Workflow, label: 'State Machines', description: 'Entity lifecycle state transitions', category: 'Automation' },
};

// Group config types by category
const CONFIG_CATEGORIES = [
  { name: 'Automation', types: ['rule', 'derivation', 'validation_constraint', 'metric', 'view', 'state_machine', 'interpreter_pipeline', 'interpreter_executor_def'] as ConfigTypeSlug[] },
  { name: 'Workflows', types: ['workflow', 'workflow_step', 'workflow_step_type'] as ConfigTypeSlug[] },
  { name: 'Commercial', types: ['pipeline_stage'] as ConfigTypeSlug[] },
  { name: 'Schema', types: ['object_def', 'field_def'] as ConfigTypeSlug[] },
  { name: 'Activities', types: ['activity_def'] as ConfigTypeSlug[] },
  { name: 'Scoring', types: ['health_config'] as ConfigTypeSlug[] },
  { name: 'Security', types: ['access_policy'] as ConfigTypeSlug[] },
  { name: 'CRM', types: ['persona'] as ConfigTypeSlug[] },
];

// Map config types to entity types for fetching
const CONFIG_TO_ENTITY: Record<ConfigTypeSlug, string> = {
  rule: 'rule',
  derivation: 'derivation',
  validation_constraint: 'validation_constraint',
  metric: 'metric',
  view: 'view',
  interpreter_pipeline: 'interpreter_pipeline',
  interpreter_executor_def: 'interpreter_executor_def',
  workflow: 'workflow',
  workflow_step: 'workflow_step',
  workflow_step_type: 'workflow_step_type',
  pipeline_stage: 'pipeline_stage',
  object_def: 'object_def',
  field_def: 'field_def',
  field_group: 'object_def', // Field groups are embedded
  activity_def: 'activity_def',
  health_config: 'health_config',
  access_policy: 'rule', // Access policies are a type of rule
  persona: 'taxonomy_term', // Personas are dimension values
  state_machine: 'state_machine',
};

interface ConfigCount {
  type: ConfigTypeSlug;
  count: number;
}

export function ConfigBrowser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedType = (searchParams.get('type') as ConfigTypeSlug) || 'rule';
  const searchQuery = searchParams.get('q') || '';

  const [configCounts, setConfigCounts] = useState<ConfigCount[]>([]);
  const [configs, setConfigs] = useState<Entity[]>([]);
  const [_countsLoading, setCountsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load config counts on mount
  useEffect(() => {
    loadConfigCounts();
  }, []);

  // Load configs when type changes
  useEffect(() => {
    loadConfigs(selectedType);
  }, [selectedType]);

  const loadConfigCounts = async () => {
    try {
      // Fetch counts for each config type
      const counts: ConfigCount[] = [];
      const entityTypes = [...new Set(Object.values(CONFIG_TO_ENTITY))];

      for (const entityType of entityTypes) {
        try {
          const entities = await api.listEntities(entityType);
          counts.push({
            type: Object.entries(CONFIG_TO_ENTITY).find(([_, v]) => v === entityType)?.[0] as ConfigTypeSlug,
            count: entities.length,
          });
        } catch {
          // Silently handle - some types may not exist yet
        }
      }

      setConfigCounts(counts);
    } catch (err) {
      console.warn('Failed to load config counts:', err);
    } finally {
      setCountsLoading(false);
    }
  };

  const loadConfigs = async (type: ConfigTypeSlug) => {
    setListLoading(true);
    setError(null);

    try {
      const entityType = CONFIG_TO_ENTITY[type];

      // Special handling for personas (dimension values)
      if (type === 'persona') {
        const values = await api.listDimensionValues('persona');
        // Convert dimension values to Entity-like format
        const entities: Entity[] = values.map(v => ({
          id: v.id,
          type: 'persona',
          slug: v.slug,
          name: v.label,
          data: { ...v.metadata } as any,
          created_at: v.created_at,
          updated_at: v.updated_at,
        }));
        setConfigs(entities);
      } else {
        const entities = await api.listEntities(entityType);
        setConfigs(entities);
      }
    } catch (err) {
      console.error(`Failed to load ${type} configs:`, err);
      setError(`Failed to load ${type} configurations`);
      setConfigs([]);
    } finally {
      setListLoading(false);
    }
  };

  const selectType = (type: ConfigTypeSlug) => {
    setSearchParams({ type });
  };

  const getCountForType = (type: ConfigTypeSlug): number => {
    return configCounts.find(c => c.type === type)?.count || 0;
  };

  // Filter configs by search query
  const filteredConfigs = useMemo(() => {
    if (!searchQuery) return configs;
    const q = searchQuery.toLowerCase();
    return configs.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  }, [configs, searchQuery]);

  const meta = CONFIG_TYPE_META[selectedType];
  const Icon = meta?.icon || Settings;

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Config Type Navigation */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={20} className="text-indigo-400" />
            Configuration
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Browse system configuration</p>
        </div>

        <nav className="p-2">
          {CONFIG_CATEGORIES.map(category => (
            <div key={category.name} className="mb-4">
              <h3 className="px-2 py-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {category.name}
              </h3>
              {category.types.map(type => {
                const typeMeta = CONFIG_TYPE_META[type];
                const TypeIcon = typeMeta?.icon || Settings;
                const count = getCountForType(type);
                const isSelected = selectedType === type;

                return (
                  <button
                    key={type}
                    onClick={() => selectType(type)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <TypeIcon size={16} />
                    <span className="flex-1 text-left truncate">{typeMeta?.label || type}</span>
                    {count > 0 && (
                      <span className={`text-xs px-1.5 rounded ${
                        isSelected ? 'bg-indigo-600/30 text-indigo-300' : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <Icon size={24} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">{meta?.label || selectedType}</h1>
                <p className="text-sm text-zinc-400">{meta?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadConfigs(selectedType)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => navigate('/workspaces/new')}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                New in Workspace
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchParams({ type: selectedType, q: e.target.value })}
              placeholder={`Search ${meta?.label.toLowerCase() || 'configs'}...`}
              className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Config List */}
        <div className="flex-1 overflow-y-auto p-6">
          {listLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-sm text-zinc-500">Loading configurations...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <button
                  onClick={() => loadConfigs(selectedType)}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Icon size={48} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 mb-2">
                  {searchQuery
                    ? `No ${meta?.label.toLowerCase() || 'configs'} match "${searchQuery}"`
                    : `No ${meta?.label.toLowerCase() || 'configurations'} found`
                  }
                </p>
                <button
                  onClick={() => navigate('/workspaces/new')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Create one in a workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConfigs.map(config => (
                <ConfigRow
                  key={config.id}
                  config={config}
                  type={selectedType}
                  onViewVersions={() => navigate(`/config/${selectedType}/${config.id}/versions`)}
                  onClick={() => navigate(`/config/${selectedType}/${config.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConfigRowProps {
  config: Entity;
  type: ConfigTypeSlug;
  onViewVersions: () => void;
  onClick: () => void;
}

function ConfigRow({ config, type, onViewVersions, onClick }: ConfigRowProps) {
  const meta = CONFIG_TYPE_META[type];

  // Extract key info based on config type
  const getSubtitle = (): string => {
    const data = (config.data || {}) as unknown as Record<string, unknown>;
    switch (type) {
      case 'rule':
        return `${data.triggerEvent || ''} on ${data.triggerEntityType || ''}`;
      case 'derivation':
        return `${data.targetEntityType || ''}.${data.fieldName || ''}`;
      case 'validation_constraint':
        return `${data.entity_type || ''} - ${data.constraint_type || ''}`;
      case 'pipeline_stage':
        return `${data.pipeline_type || ''} / ${data.stage || ''}`;
      case 'workflow':
        return `${data.trigger_type || ''} trigger`;
      case 'workflow_step':
        return `${data.step_type || ''} step`;
      case 'activity_def':
        return String(data.archetype || '');
      case 'object_def':
      case 'field_def':
        return config.slug || '';
      default:
        return config.slug || '';
    }
  };

  // Check if config is active/enabled
  const isActive = (): boolean => {
    const data = (config.data || {}) as unknown as Record<string, unknown>;
    return data.isActive !== false && data.is_active !== false;
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg cursor-pointer transition-colors group"
    >
      <div className={`p-2 rounded-lg ${isActive() ? 'bg-indigo-600/20' : 'bg-zinc-700/50'}`}>
        {meta?.icon ? <meta.icon size={20} className={isActive() ? 'text-indigo-400' : 'text-zinc-500'} /> : <Settings size={20} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white truncate">{config.name || config.slug}</h3>
          {!isActive() && (
            <span className="px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded">Inactive</span>
          )}
        </div>
        <p className="text-sm text-zinc-400 truncate">{getSubtitle()}</p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewVersions();
          }}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          title="View version history"
        >
          <History size={16} />
        </button>
        <ChevronRight size={18} className="text-zinc-500" />
      </div>
    </div>
  );
}

export default ConfigBrowser;

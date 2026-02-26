/**
 * ConfigDetailView - View and edit a single configuration record
 *
 * Features:
 * - JSON editor for config data
 * - Version history view
 * - Save changes via workspace
 * - Validation feedback
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  History,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  GitBranch,
  Copy,
  Settings,
  Zap,
  Calculator,
  Shield,
  BarChart3,
  Eye,
  Footprints,
  Box,
  Activity,
  Layers,
  FileText,
  Heart,
  Lock,
  Users,
  Workflow,
} from 'lucide-react';
import {
  api,
  type ConfigTypeSlug,
  type Entity,
  type ConfigVersion,
  type InterpreterEvent,
  type InterpreterExecutorInfo,
} from '../lib/api';
import { StateMachineViewer } from '../components/StateMachineViewer';
import { WorkflowDiagram } from '../components/WorkflowDiagram';

// Config type metadata
const CONFIG_TYPE_META: Record<ConfigTypeSlug, { icon: typeof Settings; label: string }> = {
  rule: { icon: Zap, label: 'Business Rule' },
  derivation: { icon: Calculator, label: 'Computed Field' },
  validation_constraint: { icon: Shield, label: 'Validation Constraint' },
  metric: { icon: BarChart3, label: 'Rollup Metric' },
  view: { icon: Eye, label: 'Data View' },
  interpreter_pipeline: { icon: Workflow, label: 'Interpreter Pipeline' },
  interpreter_executor_def: { icon: Workflow, label: 'Interpreter Executor Definition' },
  workflow: { icon: GitBranch, label: 'Workflow' },
  workflow_step: { icon: Footprints, label: 'Workflow Step' },
  workflow_step_type: { icon: Box, label: 'Step Type' },
  pipeline_stage: { icon: Activity, label: 'Pipeline Stage' },
  object_def: { icon: Layers, label: 'Object Definition' },
  field_def: { icon: FileText, label: 'Field Definition' },
  field_group: { icon: Layers, label: 'Field Group' },
  activity_def: { icon: Activity, label: 'Activity Definition' },
  health_config: { icon: Heart, label: 'Health Configuration' },
  access_policy: { icon: Lock, label: 'Access Policy' },
  persona: { icon: Users, label: 'Persona' },
  state_machine: { icon: Workflow, label: 'State Machine' },
};

// Map config types to entity types
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
  field_group: 'object_def',
  activity_def: 'activity_def',
  health_config: 'health_config',
  access_policy: 'rule',
  persona: 'taxonomy_term',
  state_machine: 'state_machine',
};

const INTERPRETER_EVENTS = new Set<InterpreterEvent>([
  'pre_create',
  'post_create',
  'pre_update',
  'post_update',
  'pre_delete',
  'post_delete',
]);

interface InterpreterStageInlineValidation {
  index: number;
  order: number;
  executor: string;
  entityTypes: string[];
  valid: boolean;
  errors: string[];
  line?: number;
  column?: number;
}

export function ConfigDetailView() {
  const { type, id } = useParams<{ type: ConfigTypeSlug; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isVersionsView = location.pathname.endsWith('/versions');

  const [config, setConfig] = useState<Entity | null>(null);
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [editedData, setEditedData] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: Array<{ path: string; message: string }> } | null>(null);
  const [stageJumpMessage, setStageJumpMessage] = useState<string | null>(null);
  const [stageValidation, setStageValidation] = useState<{
    loading: boolean;
    stages: InterpreterStageInlineValidation[];
    runError: string | null;
  }>({
    loading: false,
    stages: [],
    runError: null,
  });

  // Save state
  const [saving, setSaving] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const jsonEditorRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (type && id) {
      loadConfig();
    }
  }, [type, id]);

  useEffect(() => {
    if (isVersionsView && type && id) {
      loadVersions();
    }
  }, [isVersionsView, type, id]);

  const loadConfig = async () => {
    if (!type || !id) return;

    setLoading(true);
    setError(null);

    try {
      // Special handling for personas
      if (type === 'persona') {
        const values = await api.listDimensionValues('persona');
        const found = values.find(v => v.id === id);
        if (found) {
          const entity: Entity = {
            id: found.id,
            type: 'persona',
            slug: found.slug,
            name: found.label,
            data: { ...found.metadata } as any,
            created_at: found.created_at,
            updated_at: found.updated_at,
          };
          setConfig(entity);
          setEditedData(JSON.stringify(entity.data, null, 2));
        } else {
          setError('Persona not found');
        }
      } else {
        const entity = await api.getEntity(id);
        setConfig(entity);
        setEditedData(JSON.stringify(entity.data, null, 2));
      }
    } catch (err) {
      console.error('Failed to load config:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    if (!type || !id) return;

    setVersionsLoading(true);
    try {
      const entityType = CONFIG_TO_ENTITY[type];
      const versionList = await api.getConfigVersions(entityType, id, 20);
      setVersions(versionList);
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleDataChange = (value: string) => {
    setEditedData(value);
    setIsDirty(true);
    setJsonError(null);
    setValidationResult(null);
    setStageJumpMessage(null);

    // Validate JSON syntax
    try {
      JSON.parse(value);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const validateConfig = async () => {
    if (!type || jsonError) return;

    try {
      const data = JSON.parse(editedData);
      const schemaResult = await api.validateConfig(type, data);

      let mergedErrors = [...schemaResult.errors];

      if (type === 'interpreter_pipeline') {
        const stageResult = await validateInterpreterPipelineStages(data);
        mergedErrors = [...mergedErrors, ...stageResult.errors];
      }

      const deduped = dedupeValidationErrors(mergedErrors);
      const result = {
        valid: schemaResult.valid && deduped.length === 0,
        errors: deduped,
      };

      setValidationResult(result);
      return result.valid;
    } catch (err) {
      console.error('Validation failed:', err);
      return false;
    }
  };

  const validateInterpreterPipelineStages = async (
    data: Record<string, unknown>
  ): Promise<{
    errors: Array<{ path: string; message: string }>;
    stageResults: InterpreterStageInlineValidation[];
  }> => {
    const errors: Array<{ path: string; message: string }> = [];
    const stageResults: InterpreterStageInlineValidation[] = [];
    const accountId = localStorage.getItem('vi_active_account') || undefined;

    const eventCandidate = typeof data.event === 'string'
      ? data.event
      : typeof (data as any).Event === 'string'
        ? (data as any).Event
        : '';

    if (!INTERPRETER_EVENTS.has(eventCandidate as InterpreterEvent)) {
      errors.push({
        path: 'event',
        message: `Invalid interpreter event "${eventCandidate || '(missing)'}"`,
      });
      return { errors, stageResults };
    }

    const event = eventCandidate as InterpreterEvent;
    const rawStages = Array.isArray((data as any).stages)
      ? (data as any).stages
      : Array.isArray((data as any).Stages)
        ? (data as any).Stages
        : [];

    if (!Array.isArray(rawStages) || rawStages.length === 0) {
      return { errors, stageResults };
    }

    let executorCatalog: InterpreterExecutorInfo[] = [];
    try {
      executorCatalog = await api.listInterpreterExecutors(accountId);
    } catch (err) {
      console.error('Failed to load interpreter executor catalog:', err);
    }
    const executorMap = new Map(executorCatalog.map(executor => [executor.key, executor]));

    for (let idx = 0; idx < rawStages.length; idx++) {
      const stage = rawStages[idx] as Record<string, unknown>;
      const stageOrder = typeof stage.order === 'number'
        ? stage.order
        : typeof stage.sequence === 'number'
          ? stage.sequence
          : idx;
      const executor = typeof stage.executor === 'string'
        ? stage.executor.trim()
        : typeof stage.type === 'string'
          ? String(stage.type).trim()
          : '';

      const stageEntry: InterpreterStageInlineValidation = {
        index: idx,
        order: stageOrder,
        executor: executor || '(missing)',
        entityTypes: [],
        valid: true,
        errors: [],
      };

      if (!executor) {
        errors.push({
          path: `stages[${idx}].executor`,
          message: 'Executor is required',
        });
        stageEntry.valid = false;
        stageEntry.errors.push('Executor is required');
        stageResults.push(stageEntry);
        continue;
      }

      const stageEntityTypes = Array.isArray(stage.appliesToEntityTypes)
        ? stage.appliesToEntityTypes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];

      const catalog = executorMap.get(executor);
      const candidateEntityTypes = stageEntityTypes.length > 0
        ? stageEntityTypes
        : catalog?.supportedEntityTypes?.length
          ? catalog.supportedEntityTypes
          : ['contact'];
      stageEntry.entityTypes = [...candidateEntityTypes];

      const stageOptions = stage.options && typeof stage.options === 'object'
        ? stage.options as Record<string, unknown>
        : undefined;

      for (const entityType of candidateEntityTypes) {
        try {
          const validation = await api.validateInterpreterStage({
            account_id: accountId,
            event,
            entity_type: entityType,
            stage: {
              executor,
              order: stageOrder,
              options: stageOptions,
            },
          });

          if (!validation.valid) {
            stageEntry.valid = false;
            for (const message of validation.errors) {
              const stageMessage = candidateEntityTypes.length > 1
                ? `[${entityType}] ${message}`
                : message;
              stageEntry.errors.push(stageMessage);
              errors.push({
                path: `stages[${idx}]`,
                message: stageMessage,
              });
            }
          }
        } catch (err) {
          stageEntry.valid = false;
          const stageMessage = `Stage validation request failed: ${err instanceof Error ? err.message : String(err)}`;
          stageEntry.errors.push(stageMessage);
          errors.push({
            path: `stages[${idx}]`,
            message: stageMessage,
          });
        }
      }

      stageEntry.errors = Array.from(new Set(stageEntry.errors));
      stageResults.push(stageEntry);
    }

    return { errors, stageResults };
  };

  const dedupeValidationErrors = (errors: Array<{ path: string; message: string }>) => {
    const seen = new Set<string>();
    const deduped: Array<{ path: string; message: string }> = [];
    for (const error of errors) {
      const key = `${error.path}::${error.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(error);
    }
    return deduped;
  };

  const skipWhitespace = (text: string, start: number): number => {
    let i = start;
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    return i;
  };

  const readStringEnd = (text: string, quoteStart: number): number => {
    let i = quoteStart + 1;
    while (i < text.length) {
      if (text[i] === '\\') {
        i += 2;
        continue;
      }
      if (text[i] === '"') {
        return i + 1;
      }
      i++;
    }
    return text.length;
  };

  const readBalancedEnd = (text: string, start: number, open: string, close: string): number => {
    let i = start + 1;
    let depth = 1;
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"') {
        i = readStringEnd(text, i);
        continue;
      }
      if (ch === open) {
        depth++;
      } else if (ch === close) {
        depth--;
        if (depth === 0) {
          return i + 1;
        }
      }
      i++;
    }
    return text.length;
  };

  const readJsonValueEnd = (text: string, valueStart: number): number => {
    const ch = text[valueStart];
    if (!ch) return valueStart;

    if (ch === '"') return readStringEnd(text, valueStart);
    if (ch === '{') return readBalancedEnd(text, valueStart, '{', '}');
    if (ch === '[') return readBalancedEnd(text, valueStart, '[', ']');

    let i = valueStart;
    while (i < text.length) {
      const current = text[i];
      if (current === ',' || current === ']') break;
      i++;
    }
    return i;
  };

  const parseArrayElementRanges = (
    text: string,
    arrayStart: number
  ): Array<{ start: number; end: number }> => {
    const ranges: Array<{ start: number; end: number }> = [];
    let i = arrayStart + 1;

    while (i < text.length) {
      i = skipWhitespace(text, i);
      if (i >= text.length || text[i] === ']') break;

      const start = i;
      const end = readJsonValueEnd(text, i);
      ranges.push({ start, end });

      i = skipWhitespace(text, end);
      if (text[i] === ',') {
        i++;
      } else if (text[i] === ']') {
        break;
      }
    }

    return ranges;
  };

  const getLineAndColumn = (text: string, offset: number): { line: number; column: number } => {
    let line = 1;
    let column = 1;

    for (let i = 0; i < offset && i < text.length; i++) {
      if (text[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return { line, column };
  };

  const findStageRangeInJson = (text: string, stageIndex: number): { start: number; end: number } | null => {
    for (const key of ['stages', 'Stages']) {
      const pattern = new RegExp(`"${key}"\\s*:\\s*\\[`, 'g');
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const startBracket = match.index + match[0].lastIndexOf('[');
        const ranges = parseArrayElementRanges(text, startBracket);
        if (stageIndex >= 0 && stageIndex < ranges.length) {
          return ranges[stageIndex];
        }
      }
    }
    return null;
  };

  const withStageLocations = (
    stages: InterpreterStageInlineValidation[],
    sourceJson: string
  ): InterpreterStageInlineValidation[] => {
    return stages.map(stage => {
      const range = findStageRangeInJson(sourceJson, stage.index);
      if (!range) {
        return {
          ...stage,
          line: undefined,
          column: undefined,
        };
      }

      const location = getLineAndColumn(sourceJson, range.start);
      return {
        ...stage,
        line: location.line,
        column: location.column,
      };
    });
  };

  const jumpToStageInEditor = (stage: InterpreterStageInlineValidation) => {
    const editor = jsonEditorRef.current;
    if (!editor) return;

    const range = findStageRangeInJson(editedData, stage.index);
    if (!range) {
      setStageJumpMessage(`Could not locate stage #${stage.order} in the JSON editor.`);
      return;
    }

    setStageJumpMessage(null);
    editor.focus();
    editor.setSelectionRange(range.start, range.end);
  };

  useEffect(() => {
    if (type !== 'interpreter_pipeline') {
      setStageValidation({ loading: false, stages: [], runError: null });
      return;
    }

    if (jsonError) {
      setStageValidation({ loading: false, stages: [], runError: null });
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(editedData);
      } catch {
        return;
      }

      setStageValidation(prev => ({ ...prev, loading: true, runError: null }));
      try {
        const stageResult = await validateInterpreterPipelineStages(parsed);
        if (cancelled) return;
        const stagesWithLocation = withStageLocations(stageResult.stageResults, editedData);
        setStageValidation({
          loading: false,
          stages: stagesWithLocation,
          runError: null,
        });
      } catch (err) {
        if (cancelled) return;
        setStageValidation({
          loading: false,
          stages: [],
          runError: err instanceof Error ? err.message : String(err),
        });
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [type, editedData, jsonError]);

  const handleSave = async () => {
    if (!config || !type || jsonError) return;

    const isValid = await validateConfig();
    if (!isValid) {
      return;
    }

    // Open workspace modal to save changes
    setShowWorkspaceModal(true);
  };

  const saveToWorkspace = async (workspaceName: string) => {
    if (!config || !type) return;

    setSaving(true);
    try {
      const accountId = localStorage.getItem('vi_active_account') || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

      // Create a new workspace
      const workspace = await api.createWorkspace({
        account_id: accountId,
        name: workspaceName,
        description: `Update ${CONFIG_TYPE_META[type]?.label || type}: ${config.name || config.slug}`,
      });

      // Add the change
      await api.addWorkspaceChange(workspace.id, {
        config_type: type,
        operation: 'update',
        target_id: config.id,
        target_slug: config.slug,
        payload: JSON.parse(editedData),
      });

      // Navigate to workspace
      navigate(`/workspaces/${workspace.id}`);
    } catch (err) {
      console.error('Failed to save to workspace:', err);
      setError('Failed to create workspace');
    } finally {
      setSaving(false);
      setShowWorkspaceModal(false);
    }
  };

  const restoreVersion = async (version: number) => {
    if (!type || !id) return;

    try {
      const entityType = CONFIG_TO_ENTITY[type];
      await api.restoreConfigVersion(entityType, id, version);
      // Reload config and versions
      await loadConfig();
      await loadVersions();
    } catch (err) {
      console.error('Failed to restore version:', err);
      setError('Failed to restore version');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-zinc-500">Loading configuration...</span>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-red-400 mb-2">{error || 'Configuration not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const meta = CONFIG_TYPE_META[type!];
  const Icon = meta?.icon || Settings;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/config')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <Icon size={24} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">{config.name || config.slug}</h1>
                <p className="text-sm text-zinc-400">{meta?.label || type}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(isVersionsView ? `/config/${type}/${id}` : `/config/${type}/${id}/versions`)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isVersionsView
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <History size={16} />
              Versions
            </button>
            {!isVersionsView && (
              <button
                onClick={handleSave}
                disabled={!isDirty || !!jsonError || saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDirty && !jsonError
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                Save to Workspace
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {isVersionsView ? (
          // Version History View
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <History size={20} className="text-indigo-400" />
              Version History
            </h2>

            {versionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12">
                <History size={48} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">No version history available</p>
                <p className="text-sm text-zinc-500 mt-1">Versions are created when changes are applied via workspaces</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          index === 0
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          v{version.version}
                        </span>
                        {index === 0 && (
                          <span className="text-xs text-green-400">Current</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                        {index > 0 && (
                          <button
                            onClick={() => restoreVersion(version.version)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-400 hover:bg-indigo-600/20 rounded transition-colors"
                          >
                            <RotateCcw size={12} />
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                    {version.change_summary && (
                      <p className="text-sm text-zinc-400 mb-2">{version.change_summary}</p>
                    )}
                    {version.workspace_id && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <GitBranch size={12} />
                        Applied from workspace
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Editor View
          <div className="flex-1 flex flex-col p-6">
            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Slug</p>
                <p className="text-sm text-white font-mono">{config.slug}</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Created</p>
                <p className="text-sm text-white">{new Date(config.created_at).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Updated</p>
                <p className="text-sm text-white">{new Date(config.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Validation feedback */}
            {(jsonError || validationResult) && (
              <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                jsonError || !validationResult?.valid
                  ? 'bg-red-900/20 border border-red-800/50'
                  : 'bg-green-900/20 border border-green-800/50'
              }`}>
                {jsonError ? (
                  <>
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Invalid JSON</p>
                      <p className="text-xs text-red-300">{jsonError}</p>
                    </div>
                  </>
                ) : validationResult && !validationResult.valid ? (
                  <>
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Validation Failed</p>
                      <ul className="text-xs text-red-300 mt-1">
                        {validationResult.errors.map((err, i) => (
                          <li key={i}>{err.path}: {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="text-green-400 mt-0.5" />
                    <p className="text-sm text-green-400">Configuration is valid</p>
                  </>
                )}
              </div>
            )}

            {/* Inline stage validation for interpreter pipelines */}
            {type === 'interpreter_pipeline' && (
              <div className="mb-4 p-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">Stage Validator</p>
                    <p className="text-xs text-zinc-400">
                      Per-stage checks run automatically while you edit.
                    </p>
                  </div>
                  {stageValidation.loading ? (
                    <span className="inline-flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-indigo-400 rounded-full animate-spin" />
                      Validating...
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        stageValidation.stages.some(stage => !stage.valid)
                          ? 'bg-red-900/40 text-red-300 border border-red-700/50'
                          : stageValidation.stages.length > 0
                            ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                      }`}
                    >
                      {stageValidation.stages.length === 0
                        ? 'No stages'
                        : stageValidation.stages.some(stage => !stage.valid)
                          ? `${stageValidation.stages.filter(stage => !stage.valid).length} invalid`
                          : `${stageValidation.stages.length} valid`}
                    </span>
                  )}
                </div>

                {stageValidation.runError && (
                  <p className="mt-3 text-xs text-red-300">
                    Stage validation failed: {stageValidation.runError}
                  </p>
                )}

                {stageJumpMessage && (
                  <p className="mt-2 text-xs text-amber-300">
                    {stageJumpMessage}
                  </p>
                )}

                {!stageValidation.loading && stageValidation.stages.length > 0 && (
                  <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
                    {stageValidation.stages.map(stage => (
                      <div
                        key={`${stage.index}-${stage.executor}`}
                        className={`rounded-md border p-2 ${
                          stage.valid
                            ? 'border-green-700/40 bg-green-900/10'
                            : 'border-red-700/40 bg-red-900/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-mono text-zinc-200">
                            #{stage.order} {stage.executor}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => jumpToStageInEditor(stage)}
                              className="text-[11px] px-2 py-0.5 rounded border border-zinc-600/70 text-zinc-300 hover:text-white hover:border-zinc-400 hover:bg-zinc-700/30 transition-colors"
                            >
                              Jump
                            </button>
                            <span className={`text-[11px] px-2 py-0.5 rounded ${
                              stage.valid ? 'text-green-300 bg-green-900/40' : 'text-red-300 bg-red-900/40'
                            }`}>
                              {stage.valid ? 'Valid' : 'Invalid'}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Entity types: {stage.entityTypes.length > 0 ? stage.entityTypes.join(', ') : 'n/a'}
                        </p>
                        {stage.line && stage.column && (
                          <p className="text-[11px] text-zinc-500 mt-1">
                            JSON location: line {stage.line}, column {stage.column}
                          </p>
                        )}
                        {!stage.valid && stage.errors.length > 0 && (
                          <ul className="mt-2 space-y-1 text-[11px] text-red-300">
                            {stage.errors.map((message, idx) => (
                              <li key={`${stage.index}-error-${idx}`}>{message}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visual Preview for State Machines */}
            {type === 'state_machine' && config.data && (
              <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                <StateMachineViewer
                  entityType={(config.data as any).targetEntityType || (config.data as any)['Target Entity Type'] || 'unknown'}
                />
              </div>
            )}

            {/* Visual Preview for Workflows */}
            {type === 'workflow' && config.slug && (
              <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                <WorkflowDiagram workflowSlug={config.slug} />
              </div>
            )}

            {/* JSON Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-400">Configuration Data (JSON)</label>
                <button
                  onClick={() => navigator.clipboard.writeText(editedData)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
              <textarea
                ref={jsonEditorRef}
                value={editedData}
                onChange={(e) => handleDataChange(e.target.value)}
                className="flex-1 w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <WorkspaceModal
          configName={config.name || config.slug}
          configType={meta?.label || type!}
          onSave={saveToWorkspace}
          onCancel={() => setShowWorkspaceModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

interface WorkspaceModalProps {
  configName: string;
  configType: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  saving: boolean;
}

function WorkspaceModal({ configName, configType, onSave, onCancel, saving }: WorkspaceModalProps) {
  const [name, setName] = useState(`Update ${configType}: ${configName}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <GitBranch size={20} className="text-indigo-400" />
          Create Workspace
        </h2>

        <p className="text-sm text-zinc-400 mb-4">
          Changes will be saved to a new workspace. You can preview and apply them later.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Workspace Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter workspace name..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name)}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={16} />
                Create & Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfigDetailView;

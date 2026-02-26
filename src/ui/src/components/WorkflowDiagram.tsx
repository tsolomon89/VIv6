/**
 * WorkflowDiagram - Visual workflow step flow
 *
 * Features:
 * - Steps displayed vertically with connecting lines
 * - Branch paths shown with split indicators
 * - Step type icons (wait, send, branch, complete, query)
 * - Current enrollment position highlighted
 * - Expandable step details
 */

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Clock,
  Send,
  GitBranch,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Play,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
} from 'lucide-react';

// Step type icon mapping
const STEP_TYPE_ICONS: Record<string, typeof Clock> = {
  wait: Clock,
  send: Send,
  branch: GitBranch,
  complete: CheckCircle,
  query: HelpCircle,
  advance_stage: ArrowRight,
  generate_activities: Activity,
  update: Zap,
};

const STEP_TYPE_COLORS: Record<string, string> = {
  wait: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  send: 'bg-blue-100 text-blue-700 border-blue-300',
  branch: 'bg-purple-100 text-purple-700 border-purple-300',
  complete: 'bg-green-100 text-green-700 border-green-300',
  query: 'bg-orange-100 text-orange-700 border-orange-300',
  advance_stage: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  generate_activities: 'bg-teal-100 text-teal-700 border-teal-300',
  update: 'bg-pink-100 text-pink-700 border-pink-300',
};

interface WorkflowStep {
  id: string;
  slug: string;
  name: string;
  sequence: number;
  stepType: string;
  nextStepSlug?: string;
  branchStepSlug?: string;
  data: Record<string, unknown>;
}

interface Workflow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  triggerType: string;
  triggerEvent?: string;
  isActive: boolean;
  firstStepSlug?: string;
}

interface WorkflowDiagramProps {
  workflowSlug: string;
  currentStepSlug?: string;
  onStepClick?: (step: WorkflowStep) => void;
}

export function WorkflowDiagram({
  workflowSlug,
  currentStepSlug,
  onStepClick
}: WorkflowDiagramProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.getWorkflow(workflowSlug)
      .then(data => {
        if (data) {
          setWorkflow(data.workflow);
          setSteps(data.steps);
        } else {
          setError(`Workflow not found: ${workflowSlug}`);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load workflow');
        setLoading(false);
      });
  }, [workflowSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Loading workflow...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
        Workflow not found: {workflowSlug}
      </div>
    );
  }

  const handleStepClick = (step: WorkflowStep) => {
    setExpandedStep(expandedStep === step.slug ? null : step.slug);
    onStepClick?.(step);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
          <span className={`
            px-2 py-0.5 text-xs rounded-full
            ${workflow.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {workflow.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {workflow.summary && (
          <p className="text-sm text-gray-500 mt-1">{workflow.summary}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>
            Trigger: <code className="bg-gray-100 px-1 rounded">{workflow.triggerEvent || workflow.triggerType}</code>
          </span>
          <span>
            Steps: <strong>{steps.length}</strong>
          </span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const Icon = STEP_TYPE_ICONS[step.stepType] || HelpCircle;
          const colors = STEP_TYPE_COLORS[step.stepType] || 'bg-gray-100 text-gray-700 border-gray-300';
          const isCurrent = step.slug === currentStepSlug;
          const isFirst = step.slug === workflow.firstStepSlug;
          const isExpanded = expandedStep === step.slug;
          const isLast = !step.nextStepSlug && step.stepType !== 'branch';

          return (
            <div key={step.id} className="relative">
              {/* Connecting Line */}
              {index > 0 && (
                <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-300" />
              )}

              {/* Step Node */}
              <button
                onClick={() => handleStepClick(step)}
                className={`
                  w-full flex items-start gap-3 p-3 rounded-lg border transition-all
                  ${isCurrent
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {/* Step Icon */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-lg border
                  ${colors}
                `}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Step Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{step.name}</span>
                    {isFirst && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Play className="w-3 h-3" /> Start
                      </span>
                    )}
                    {isLast && step.stepType === 'complete' && (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <CheckCircle className="w-3 h-3" /> End
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="capitalize">{step.stepType.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Seq {step.sequence}</span>
                    {step.stepType === 'branch' && (
                      <>
                        <span>•</span>
                        <span className="text-purple-600">
                          Branch to {step.branchStepSlug}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse */}
                <div className="text-gray-400">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="ml-15 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <h5 className="font-medium text-gray-700 mb-2">Step Configuration</h5>
                  <div className="space-y-1 text-gray-600">
                    {step.nextStepSlug && (
                      <p>
                        Next: <code className="bg-gray-200 px-1 rounded">{step.nextStepSlug}</code>
                      </p>
                    )}
                    {step.branchStepSlug && (
                      <p>
                        Branch: <code className="bg-purple-100 px-1 rounded">{step.branchStepSlug}</code>
                      </p>
                    )}
                    {step.data && Object.keys(step.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          Raw Data
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(step.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Branch Indicator */}
              {step.stepType === 'branch' && step.branchStepSlug && (
                <div className="ml-6 mt-2 mb-2 flex items-center gap-2 text-sm text-purple-600">
                  <GitBranch className="w-4 h-4" />
                  <span>If condition met → {step.branchStepSlug}</span>
                </div>
              )}

              {/* Spacing between steps */}
              {index < steps.length - 1 && <div className="h-4" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact workflow badge showing step count and status
 */
export function WorkflowBadge({
  workflowSlug,
  showStepCount = true
}: {
  workflowSlug: string;
  showStepCount?: boolean;
}) {
  const [workflow, setWorkflow] = useState<{ name: string; isActive: boolean; stepCount: number } | null>(null);

  useEffect(() => {
    api.getWorkflow(workflowSlug)
      .then(data => {
        if (data) {
          setWorkflow({
            name: data.workflow.name,
            isActive: data.workflow.isActive,
            stepCount: data.steps.length
          });
        }
      })
      .catch(() => setWorkflow(null));
  }, [workflowSlug]);

  if (!workflow) return null;

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <GitBranch className="w-4 h-4 text-gray-400" />
      <span className="font-medium text-gray-700">{workflow.name}</span>
      {showStepCount && (
        <span className="text-gray-400">({workflow.stepCount} steps)</span>
      )}
      <span className={`
        w-2 h-2 rounded-full
        ${workflow.isActive ? 'bg-green-500' : 'bg-gray-300'}
      `} />
    </div>
  );
}

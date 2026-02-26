/**
 * StateMachineViewer - Visual representation of state machine transitions
 *
 * Features:
 * - State nodes displayed as chips/badges
 * - Transition arrows showing valid state changes
 * - Highlight current state when provided
 * - Click on transitions to see conditions
 */

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Circle, ArrowRight, CheckCircle2, Play } from 'lucide-react';

interface StateTransition {
  from: string;
  to: string;
  action?: string;
  conditions?: Array<{ field: string; op: string; value: unknown }>;
}

interface StateMachineDefinition {
  targetEntityType: string;
  stateField: string;
  states: string[];
  transitions: StateTransition[];
  initialState: string;
}

interface StateMachineViewerProps {
  entityType: string;
  currentState?: string;
  onTransitionClick?: (transition: StateTransition) => void;
}

export function StateMachineViewer({
  entityType,
  currentState,
  onTransitionClick
}: StateMachineViewerProps) {
  const [machine, setMachine] = useState<StateMachineDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<StateTransition | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.getStateMachine(entityType)
      .then(data => {
        if (data) {
          setMachine(data as StateMachineDefinition);
        } else {
          setError(`No state machine defined for entity type: ${entityType}`);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load state machine');
        setLoading(false);
      });
  }, [entityType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Loading state machine...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        {error}
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
        No state machine defined for {entityType}
      </div>
    );
  }

  const handleTransitionClick = (transition: StateTransition) => {
    setSelectedTransition(transition);
    onTransitionClick?.(transition);
  };

  // Group transitions by "from" state
  const transitionsByFrom = machine.transitions.reduce((acc, t) => {
    if (!acc[t.from]) acc[t.from] = [];
    acc[t.from].push(t);
    return acc;
  }, {} as Record<string, StateTransition[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Lifecycle
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          State field: <code className="bg-gray-100 px-1 rounded">{machine.stateField}</code>
        </p>
      </div>

      {/* States */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">States</h4>
        <div className="flex flex-wrap gap-2">
          {machine.states.map(state => {
            const isInitial = state === machine.initialState;
            const isCurrent = state === currentState;

            return (
              <div
                key={state}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border
                  ${isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : isInitial
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }
                `}
              >
                {isInitial && <Play className="w-3 h-3" />}
                {isCurrent && <CheckCircle2 className="w-4 h-4" />}
                <span className="font-medium">{state}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transitions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Transitions ({machine.transitions.length})
        </h4>
        <div className="space-y-2">
          {Object.entries(transitionsByFrom).map(([fromState, transitions]) => (
            <div key={fromState} className="border rounded-lg p-3 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Circle className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-700">{fromState}</span>
              </div>
              <div className="ml-5 space-y-1">
                {transitions.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTransitionClick(t)}
                    className={`
                      flex items-center gap-2 px-2 py-1 rounded text-sm w-full text-left
                      hover:bg-gray-50 transition-colors
                      ${selectedTransition === t ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}
                    `}
                  >
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{t.to}</span>
                    {t.action && (
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {t.action}
                      </span>
                    )}
                    {t.conditions && t.conditions.length > 0 && (
                      <span className="text-xs text-orange-600">
                        ({t.conditions.length} condition{t.conditions.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Transition Details */}
      {selectedTransition && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Transition: {selectedTransition.from} → {selectedTransition.to}
          </h4>
          {selectedTransition.action && (
            <p className="text-sm text-blue-700 mb-2">
              Action: <code className="bg-blue-100 px-1 rounded">{selectedTransition.action}</code>
            </p>
          )}
          {selectedTransition.conditions && selectedTransition.conditions.length > 0 ? (
            <div>
              <p className="text-sm text-blue-700 mb-1">Conditions:</p>
              <ul className="text-sm text-blue-600 list-disc list-inside">
                {selectedTransition.conditions.map((c, idx) => (
                  <li key={idx}>
                    <code className="bg-blue-100 px-1 rounded">
                      {c.field} {c.op} {JSON.stringify(c.value)}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-blue-600">No conditions - always allowed</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact state machine badge for displaying in lists/cards
 */
export function StateMachineBadge({
  entityType,
  currentState
}: {
  entityType: string;
  currentState: string;
}) {
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);

  useEffect(() => {
    api.getStateMachineTransitions(entityType, currentState)
      .then(transitions => {
        setAllowedTransitions(transitions.map(t => t.to));
      })
      .catch(() => setAllowedTransitions([]));
  }, [entityType, currentState]);

  return (
    <div className="inline-flex items-center gap-1 text-sm">
      <span className="font-medium text-gray-700">{currentState}</span>
      {allowedTransitions.length > 0 && (
        <span className="text-gray-400">
          → {allowedTransitions.join(', ')}
        </span>
      )}
    </div>
  );
}

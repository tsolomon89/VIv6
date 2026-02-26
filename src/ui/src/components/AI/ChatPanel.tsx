import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, X, Loader2, Wrench, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import type { AIChatMessage, AIChatResponse, ApiError } from '../../lib/api';

interface ChatPanelProps {
  activityId: string;
  activityName?: string;
  onClose?: () => void;
  className?: string;
}

export function ChatPanel({ activityId, activityName, onClose, className = '' }: ChatPanelProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getAIChatHistory(activityId);
        setMessages(history.messages);
      } catch (err) {
        console.warn('Failed to load chat history:', err);
      }
    };
    loadHistory();
  }, [activityId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    // Optimistically add user message
    const userMessage: AIChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response: AIChatResponse = await api.sendAIChatMessage(activityId, trimmedInput);

      if (response.success && response.content) {
        // Add assistant message
        const assistantMessage: AIChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          toolCalls: response.toolCalls,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  }, [input, loading, activityId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <div className={`bg-zinc-900 rounded-lg border border-zinc-800 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-indigo-400" />
            <span className="text-sm font-medium">{activityName || 'AI Chat'}</span>
            {messages.length > 0 && (
              <span className="text-xs bg-zinc-700 px-1.5 py-0.5 rounded">{messages.length}</span>
            )}
          </div>
          <ChevronUp size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 rounded-lg border border-zinc-800 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-indigo-400" />
          <span className="font-medium text-sm">{activityName || 'AI Chat'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Minimize"
          >
            <ChevronDown size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm py-8">
            <Bot size={32} className="mx-auto mb-2 opacity-50" />
            <p>Start a conversation with the AI agent</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}>
                {message.role === 'user' ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {/* Tool calls */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-xs text-zinc-500"
                      >
                        <Wrench size={12} />
                        <span className="font-mono">{tc.name}</span>
                        {tc.success !== undefined && (
                          <span className={tc.success ? 'text-emerald-400' : 'text-red-400'}>
                            {tc.success ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-800 rounded-lg px-4 py-2">
              <Loader2 size={16} className="animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-zinc-800 rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

/**
 * Minimized chat toggle button for sidebar
 */
interface ChatToggleProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export function ChatToggle({ onClick, hasUnread }: ChatToggleProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
    >
      <MessageSquare size={20} />
      <span>AI Chat</span>
      {hasUnread && (
        <span className="absolute right-4 w-2 h-2 bg-indigo-500 rounded-full" />
      )}
    </button>
  );
}

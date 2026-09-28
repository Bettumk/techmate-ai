import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AppMode } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Code,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, mode: AppMode) => void;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onRegenerate?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  currentMode,
  onModeChange,
  onRegenerate,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    'Explain DBMS Normalization for a 15-mark university exam',
    'Explain Binary Search with time complexity and Python code',
    'Help me build an AI-based attendance system using facial recognition',
    'Create an actionable roadmap to become a Backend Developer',
    'How do I debug: TypeError: \'NoneType\' object is not subscriptable?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), currentMode);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: type }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Top Mode Selector Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto text-xs gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium shrink-0">Routing Mode:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            {(['AUTO', 'CODING', 'STUDY', 'PROJECT', 'CAREER', 'RESUME', 'INTERVIEW', 'PRACTICE'] as AppMode[]).map(
              (m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all ${
                    currentMode === m
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {m}
                </button>
              )
            )}
          </div>
        </div>

        {currentMode === 'AUTO' && (
          <span className="hidden md:inline-flex text-[11px] text-slate-400">
            <span className="text-blue-400 font-semibold mr-1">AUTO:</span> TechMate detects intent dynamically
          </span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-4 shadow-xl shadow-blue-500/10">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              How can TechMate AI assist you today?
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-md mb-8">
              Ask about computer science concepts, programming algorithms, university exams, system architectures, or interview strategies.
            </p>

            {/* Suggested Prompt Chips */}
            <div className="w-full max-w-xl space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-left">
                Suggested Prompts
              </p>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p, currentMode)}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span>{p}</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const feedback = feedbackGiven[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 md:p-5 shadow-sm text-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-tl-none'
                  }`}
                >
                  {/* Assistant Meta Header */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">TechMate AI</span>
                        {msg.intent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Intent: {msg.intent}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Body with Markdown */}
                  <div className="markdown-body text-sm leading-relaxed overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Assistant Actions Footer */}
                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                            feedback === 'up' ? 'text-emerald-400' : 'hover:text-slate-300'
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                            feedback === 'down' ? 'text-rose-400' : 'hover:text-slate-300'
                          }`}
                          title="Needs improvement"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {onRegenerate && (
                        <button
                          onClick={onRegenerate}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
              <span className="inline-block w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              <span>TechMate Orchestrator is analyzing intent and reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-blue-500/80 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all p-2 shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TechMate anything about coding, CSE, projects or careers..."
              rows={1}
              className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none resize-none max-h-36 min-h-[44px]"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shrink-0 ml-2 shadow-md shadow-blue-500/20"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            TechMate AI mentors your computer science and career journey. Press Enter to send, Shift+Enter for new line.
          </p>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AppMode, Conversation } from '../types';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Code2,
  FolderGit2,
  Compass,
  FileText,
  Mic,
  Trophy,
  Database,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  activeConversationId?: string;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  activeConversationId,
  conversations,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const navItems: Array<{ mode: AppMode; label: string; icon: React.ReactNode; badge?: string }> = [
    { mode: 'AUTO', label: 'TechMate Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { mode: 'STUDY', label: 'Study & Exams', icon: <BookOpen className="w-4 h-4" />, badge: '15-Marks' },
    { mode: 'CODING', label: 'Coding & Debug', icon: <Code2 className="w-4 h-4" /> },
    { mode: 'PROJECT', label: 'Project Studio', icon: <FolderGit2 className="w-4 h-4" /> },
    { mode: 'CAREER', label: 'Career Roadmaps', icon: <Compass className="w-4 h-4" /> },
    { mode: 'RESUME', label: 'Resume & ATS', icon: <FileText className="w-4 h-4" /> },
    { mode: 'INTERVIEW', label: 'Mock Interview', icon: <Mic className="w-4 h-4" />, badge: 'Turn-by-turn' },
    { mode: 'PRACTICE', label: 'Practice & Quizzes', icon: <Trophy className="w-4 h-4" /> },
    { mode: 'KNOWLEDGE_BASE', label: 'Knowledge Base (RAG)', icon: <Database className="w-4 h-4" /> },
  ];

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-800/60">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Dashboard Shortcut */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              onSelectMode('AUTO');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Overview & Dashboard</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Specialized Capability Modes */}
        <div className="px-3 py-2">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Specialized Agents
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = currentMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    onSelectMode(item.mode);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent Chats
            </span>
            <span className="text-[10px] text-slate-400">{conversations.length}</span>
          </div>

          <div className="space-y-1 mt-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 px-3 py-2 italic">
                No conversations yet. Start a new session above.
              </p>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConversationId === conv.id;
                const isEditing = editingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-800/80 text-white font-medium border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full bg-slate-950 px-2 py-1 rounded text-white text-xs border border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveRename(conv.id)}
                          className="p-1 hover:text-emerald-400 text-slate-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:text-red-400 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onSelectConversation(conv.id);
                            onCloseMobile();
                          }}
                          className="flex items-center gap-2 truncate text-left flex-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                          <span className="truncate">{conv.title}</span>
                        </button>

                        <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                          <button
                            onClick={() => handleStartRename(conv)}
                            className="p-1 hover:text-blue-400 text-slate-500"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteConversation(conv.id)}
                            className="p-1 hover:text-red-400 text-slate-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Brand Tagline */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-300">TechMate Mentor</p>
              <p className="text-[10px] text-blue-400">Learn. Build. Code. Grow.</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        </div>
      </aside>
    </>
  );
};

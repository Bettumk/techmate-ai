import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppMode, Conversation, Project } from '../types';
import {
  MessageSquare,
  BookOpen,
  Code2,
  FolderGit2,
  Compass,
  FileText,
  Mic,
  Trophy,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  onSelectMode: (mode: AppMode) => void;
  conversations: Conversation[];
  projects: Project[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectMode,
  conversations,
  projects,
  onSelectConversation,
  onNewChat,
}) => {
  const { user } = useAuth();
  const userName = user?.full_name || 'Engineer';
  const profile = user?.profile;

  const quickActions = [
    {
      title: 'Ask TechMate',
      desc: 'Instant answers on CSE subjects, algorithms & technologies',
      mode: 'AUTO' as AppMode,
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-600/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Learn a CSE Topic',
      desc: 'Generate structured 5, 10, or 15-mark university answers',
      mode: 'STUDY' as AppMode,
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Debug or Optimize Code',
      desc: 'Inspect errors, optimize Big-O, convert between languages',
      mode: 'CODING' as AppMode,
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Build a Software Project',
      desc: 'System architecture, ERD, REST APIs, and college viva prep',
      mode: 'PROJECT' as AppMode,
      icon: <FolderGit2 className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-600/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Prepare for Interview',
      desc: 'Role-based turn-by-turn simulation with real-time scoring',
      mode: 'INTERVIEW' as AppMode,
      icon: <Mic className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-600/20 to-rose-500/5 border-rose-500/30 text-rose-400',
    },
    {
      title: 'Practice & Quizzes',
      desc: 'Test your understanding on DSA, OS, DBMS with instant feedback',
      mode: 'PRACTICE' as AppMode,
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-600/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/20 p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Mentor Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            TechMate AI is tuned to your background (
            <span className="text-blue-400 font-semibold">{profile?.education_level || 'B.Tech CSE'}</span>,{' '}
            <span className="text-emerald-400 font-semibold">{profile?.primary_language || 'Python'}</span>).
            What would you like to build or master today?
          </p>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onSelectMode(action.mode)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} bg-slate-900/40 border hover:bg-slate-900/80 transition-all text-left group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    {action.icon}
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats and Learning Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Goal Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Current Career Goal</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
              Roadmap
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <p className="text-xs font-semibold text-white">
              {profile?.career_goal || 'Software Development Engineer'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Level: {profile?.experience_level || 'Beginner'} &bull; Primary: {profile?.primary_language || 'Python'}
            </p>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-2/3 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">In Progress</p>
          </div>
          <button
            onClick={() => onSelectMode('CAREER')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-purple-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Full Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Recent Mentor Sessions</h3>
            </div>
            <button
              onClick={onNewChat}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              + New Session
            </button>
          </div>

          <div className="space-y-2">
            {conversations.slice(0, 3).map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className="cursor-pointer p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{conv.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {conv.last_message ? conv.last_message.replace(/[#*`]/g, '').slice(0, 75) + '...' : 'Interactive session'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-900 shrink-0 ml-2">
                  {conv.mode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects Spotlight */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Active Software Projects</h3>
          </div>
          <button
            onClick={() => onSelectMode('PROJECT')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Open Project Studio &rarr;
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">No active projects registered yet.</p>
            <button
              onClick={() => onSelectMode('PROJECT')}
              className="mt-3 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors"
            >
              Start New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 2).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectMode('PROJECT')}
                className="cursor-pointer p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {proj.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {proj.description || 'Full-stack software architecture and schema.'}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Stack:</span>
                  <span className="text-slate-300 truncate">{proj.tech_stack || 'Python, React, DB'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

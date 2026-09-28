import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppMode } from '../types';
import {
  Sparkles,
  Bot,
  User,
  LogOut,
  Settings,
  Menu,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onOpenProfile,
  onOpenAuth,
  onToggleSidebar,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">TechMate AI</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0 Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent CSE, Coding & Career Mentor
            </p>
          </div>
        </div>
      </div>

      {/* Center Mode Indicator */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-400 font-medium">Active Agent:</span>
        <span className="font-semibold text-blue-400 capitalize">{currentMode.toLowerCase()}</span>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-2.5">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-xs font-medium text-slate-200"
              title="Personalize Learner Profile"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline">{user?.full_name?.split(' ')[0]}</span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/25 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  GitBranch,
  Layers,
  Award
} from 'lucide-react';

export const CareerView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('Backend Developer');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Engineer',
    'AI / Machine Learning Engineer',
    'DevOps & Cloud Engineer',
    'Data Analyst / Engineer'
  ];

  const handleGenerateRoadmap = async (role: string) => {
    setSelectedRole(role);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await api.sendMessage({
        content: `Create an actionable, phased career roadmap to become a ${role}. Include core skills, 2 standout portfolio projects, and GitHub optimization checklist.`,
        mode: 'CAREER',
      });
      setResult(res.content);
    } catch (err: any) {
      setResult(`### Error\nFailed to generate roadmap: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Career Guidance & Learning Roadmaps</h1>
            <p className="text-xs text-slate-400">
              Actionable phased milestones, skill gap analysis, and portfolio guidance
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Industry Phased Trees</span>
        </span>
      </div>

      {/* Role Picker Buttons */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => handleGenerateRoadmap(r)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === r
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Roadmap Content Panel */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 min-h-[450px]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p className="text-xs text-slate-400">TechMate Career Agent is designing your roadmap for {selectedRole}...</p>
          </div>
        ) : result ? (
          <div className="markdown-body text-xs md:text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
            <Compass className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm font-semibold text-slate-300">Explore Role Roadmap</p>
            <p className="text-xs text-slate-400 mt-1">Select any engineering role above to generate a zero-fluff step-by-step career path.</p>
          </div>
        )}
      </div>
    </div>
  );
};

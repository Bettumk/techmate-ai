import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import {
  Code2,
  Bug,
  Zap,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Play
} from 'lucide-react';

export const CodingView: React.FC = () => {
  const [language, setLanguage] = useState('Python');
  const [task, setTask] = useState<'generate' | 'debug' | 'optimize' | 'complexity'>('generate');
  const [inputCode, setInputCode] = useState('def solution(arr):\n    # Write or paste your logic here\n    pass');
  const [promptQuery, setPromptQuery] = useState('Implement Binary Search with step-by-step logic');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const languages = ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'C', 'SQL', 'React', 'FastAPI'];

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    let fullPrompt = '';
    if (task === 'generate') {
      fullPrompt = `Generate clean ${language} code for: ${promptQuery}. Provide Approach, Code, Explanation, and Complexity.`;
    } else if (task === 'debug') {
      fullPrompt = `Debug this ${language} code or error:\n\n${inputCode}\n\nUser Notes: ${promptQuery}`;
    } else if (task === 'optimize') {
      fullPrompt = `Optimize this ${language} code for time and space complexity:\n\n${inputCode}`;
    } else {
      fullPrompt = `Provide Big-O time and space complexity analysis for this ${language} code:\n\n${inputCode}`;
    }

    try {
      const res = await api.sendMessage({
        content: fullPrompt,
        mode: 'CODING',
      });
      setResult(res.content);
    } catch (err: any) {
      setResult(`### Error\nFailed to process coding request: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Coding & Debugging Workbench</h1>
            <p className="text-xs text-slate-400">
              Clean code generation, root-cause bug analysis, and Big-O optimization
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Terminal className="w-3.5 h-3.5" />
          <span>Multi-Language Engine</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input & Workbench Form */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
            <button
              onClick={() => setTask('generate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                task === 'generate' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Generate Code
            </button>
            <button
              onClick={() => setTask('debug')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                task === 'debug' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Debug Code
            </button>
            <button
              onClick={() => setTask('optimize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                task === 'optimize' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Optimize Big-O
            </button>
          </div>

          <form onSubmit={handleExecute} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {task === 'generate' ? 'Problem / Requirement Description' : 'Issue / Error Notes'}
              </label>
              <input
                type="text"
                value={promptQuery}
                onChange={(e) => setPromptQuery(e.target.value)}
                placeholder="e.g. Implement LRU Cache or Explain null pointer exception"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {task !== 'generate' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Code / Traceback</label>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 font-mono text-xs border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Technical Breakdown</span>
            </h3>
            {result && (
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <span className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></span>
                <p className="text-xs text-slate-400">TechMate Coding Agent is inspecting logic and syntax...</p>
              </div>
            ) : result ? (
              <div className="markdown-body text-xs md:text-sm leading-relaxed p-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <Code2 className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-xs">Select your task parameters and click Execute Analysis to generate code or debug errors.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

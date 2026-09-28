import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check
} from 'lucide-react';

export const ResumeView: React.FC = () => {
  const [resumeText, setResumeText] = useState(
`ALEX MERCER
Email: alex.mercer@email.com | GitHub: github.com/alex-mercer

TECHNICAL SKILLS:
Languages: Python, C++, SQL
Frameworks: FastAPI, React, Node.js
Databases: PostgreSQL, SQLite

PROJECTS:
1. Smart Attendance System (2024)
- Built attendance system using Python and OpenCV for college.
- Used face recognition to mark students present.
- Stored records in a database.

2. REST API Backend (2023)
- Created REST APIs and connected to database.
- Worked on user login authentication.
`
  );
  const [jobDescription, setJobDescription] = useState('Backend Engineer with Python, FastAPI, PostgreSQL, and Docker experience.');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAuditResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const prompt = `Review this resume against the target role:
Resume Content:
${resumeText}

Target Job Description:
${jobDescription}`;

      const res = await api.sendMessage({
        content: prompt,
        mode: 'RESUME',
      });
      setResult(res.content);
    } catch (err: any) {
      setResult(`### Error\nFailed to review resume: ${err.message}`);
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
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Resume Reviewer & ATS Optimizer</h1>
            <p className="text-xs text-slate-400">
              Keyword matching, structural readability, and Google XYZ impact bullet rewriting
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Realistic ATS Auditing</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <form onSubmit={handleAuditResume} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Paste Resume Text (or Project & Work Experience)
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 font-mono text-xs border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                placeholder="Paste your resume sections here..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Job Description / Industry Role
              </label>
              <input
                type="text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. Backend SDE with Python, PostgreSQL, Docker"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !resumeText.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Analyzing Resume Keywords...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Optimize Resume</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Audit Output */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>ATS & Impact Evaluation</span>
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
                <span className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></span>
                <p className="text-xs text-slate-400">TechMate Resume Agent is auditing formatting and rewriting bullet points...</p>
              </div>
            ) : result ? (
              <div className="markdown-body text-xs md:text-sm leading-relaxed p-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <FileText className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-xs">Paste your resume content and click Analyze to view matched skills and Google XYZ bullet points.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

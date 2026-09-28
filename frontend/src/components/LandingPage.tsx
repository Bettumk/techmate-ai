import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  BookOpen,
  FolderGit2,
  Compass,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle2,
  Terminal,
  BrainCircuit,
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { AppMode } from '../types';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreFeature: (mode: AppMode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartLearning, onExploreFeature }) => {
  const [activeDemoTab, setActiveDemoTab] = useState<'coding' | 'exam' | 'project' | 'interview'>('coding');

  const features = [
    {
      mode: 'CODING' as AppMode,
      icon: <Code2 className="w-6 h-6 text-blue-400" />,
      title: 'Intelligent Coding & Debugging',
      desc: 'Generates idiomatic code in Python, C++, Java, and JS with algorithmic approach and time/space complexity analysis.',
      badge: 'Multi-Language',
    },
    {
      mode: 'STUDY' as AppMode,
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      title: 'CSE Curriculum & Exam Mode',
      desc: 'Master DBMS, Operating Systems, Computer Networks, and OOP with structured 5, 10, or 15-mark university answers and diagrams.',
      badge: 'Exam Scoring',
    },
    {
      mode: 'PROJECT' as AppMode,
      icon: <FolderGit2 className="w-6 h-6 text-cyan-400" />,
      title: 'End-to-End Project Studio',
      desc: 'From problem statements to system architectures, SQL schemas, API endpoints, folder structures, and final viva voce defense.',
      badge: 'Lifecycle Support',
    },
    {
      mode: 'CAREER' as AppMode,
      icon: <Compass className="w-6 h-6 text-purple-400" />,
      title: 'Actionable Career Roadmaps',
      desc: 'Step-by-step phased learning milestones for Backend, Frontend, Full Stack, and AI/ML with skill-gap auditing.',
      badge: 'Zero-Fluff',
    },
    {
      mode: 'RESUME' as AppMode,
      icon: <FileText className="w-6 h-6 text-amber-400" />,
      title: 'Resume & ATS Optimization',
      desc: 'Audits readability, technical keywords, and transforms weak points into high-impact Google XYZ bullet points.',
      badge: 'Impact Driven',
    },
    {
      mode: 'INTERVIEW' as AppMode,
      icon: <Mic className="w-6 h-6 text-rose-400" />,
      title: 'Interactive Mock Interview',
      desc: 'Role-based simulation (Python, Backend, SDE, AI) with turn-by-turn questions, real-time grading, and model answers.',
      badge: 'Turn-by-Turn',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 overflow-hidden text-center">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TechMate AI — Multi-Agent Engineering Companion</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Learn. Build. Code. Grow.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Your intelligent AI assistant for Computer Science, programming, academic projects, and career preparation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-colors"
            >
              Explore Features
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Intent-Driven Multi-Agent Architecture
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> RAG Document Vector Search
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> University 15-Mark Exam Formatter
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            See TechMate In Action
          </h2>
          <p className="text-sm text-slate-400">
            Select a capability to preview how TechMate formulates high-depth answers
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveDemoTab('coding')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'coding'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            💻 Coding & Complexity
          </button>
          <button
            onClick={() => setActiveDemoTab('exam')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'exam'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🎓 Exam 15-Marks Rubric
          </button>
          <button
            onClick={() => setActiveDemoTab('project')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'project'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🚀 System Architecture
          </button>
          <button
            onClick={() => setActiveDemoTab('interview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'interview'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🎤 Mock Interview Turn
          </button>
        </div>

        {/* Demo Window */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-left">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 text-xs font-mono text-slate-400">techmate-orchestrator.sh</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 font-mono">
              Live Preview
            </span>
          </div>

          <div className="p-6 text-sm text-slate-300 font-mono leading-relaxed overflow-x-auto max-h-[420px] overflow-y-auto">
            {activeDemoTab === 'coding' && (
              <div>
                <span className="text-blue-400 font-bold">### Approach</span>
                <p className="mt-1 text-slate-400">
                  Binary Search divides the sorted search space in half each step by comparing target with middle element.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs">
                  <pre>{`def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`}</pre>
                </div>
                <div className="mt-4 text-xs text-slate-300">
                  <span className="text-amber-400 font-semibold">Complexity:</span> Time: <code className="text-cyan-300">O(log N)</code> | Auxiliary Space: <code className="text-cyan-300">O(1)</code>
                </div>
              </div>
            )}

            {activeDemoTab === 'exam' && (
              <div>
                <span className="text-emerald-400 font-bold"># University Exam Answer: Normalization (15 Marks)</span>
                <p className="mt-2 text-slate-400"><strong className="text-white">1. Definition:</strong> Systematic decomposition of tables to eliminate insertion, update, and deletion anomalies.</p>
                <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <p className="text-blue-300 font-semibold">Architectural Progression:</p>
                  <pre className="text-slate-400 mt-1">{`[UNNORMALIZED] -> (Atomicity) -> [1NF] -> (No Partial Dep) -> [2NF] -> (No Transitive Dep) -> [3NF]`}</pre>
                </div>
                <p className="mt-3 text-xs text-slate-400"><strong className="text-white">10. Exam Conclusion:</strong> For OLTP systems, 3NF/BCNF achieves the ideal balance of integrity and join performance.</p>
              </div>
            )}

            {activeDemoTab === 'project' && (
              <div>
                <span className="text-cyan-400 font-bold">### Project Blueprint: AI-Based Attendance System</span>
                <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <pre className="text-cyan-300">{`+-------------------+       +---------------------+       +---------------------+
| Classroom Camera  | ----> |   FastAPI Server    | ----> | InsightFace Model   |
| (RTSP Stream)     |       | (Frame Ingestion)   |       | (Feature Extractor) |
+-------------------+       +---------------------+       +---------------------+
                                       |                             |
                                       v                             v
+-------------------+       +---------------------+       +---------------------+
| React Web Portal  | <---- | REST & WebSocket API| <---- | PostgreSQL Database |
| (Faculty / Admin) |       | (Auth / Analytics)  |       | (Students & Vectors)|
+-------------------+       +---------------------+       +---------------------+`}</pre>
                </div>
                <p className="mt-3 text-xs text-slate-400"><strong className="text-white">Viva Voce Defense:</strong> "How do you prevent photo-spoofing?" &mdash; Via passive liveness EAR blink analysis.</p>
              </div>
            )}

            {activeDemoTab === 'interview' && (
              <div>
                <span className="text-rose-400 font-bold">### Question 1 of 5 (Python Developer)</span>
                <p className="mt-1 text-slate-200">"How does the Global Interpreter Lock (GIL) impact CPU-bound multithreading, and how do you achieve true parallel execution?"</p>
                <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  <p className="text-amber-400 font-semibold">Candidate Answer Submitted & Evaluated:</p>
                  <p className="mt-1 text-slate-300">Score: <span className="text-emerald-400 font-bold">9 / 10</span></p>
                  <p className="mt-1 text-slate-400">Feedback: "Accurate distinction between I/O threads and CPU multiprocessing. Mentioned `multiprocessing` process pool correctly."</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Engineered Specifically For Computer Science
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Not a generic chatbot. TechMate is an orchestration agent equipped with dedicated engineering capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              onClick={() => onExploreFeature(feat.mode)}
              className="cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-800 group-hover:bg-slate-800/80 transition-colors">
                    {feat.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Agent</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-300">TechMate AI &mdash; Intelligent CSE, Coding and Career Assistant</p>
        <p className="mt-1">Tagline: Learn. Build. Code. Grow. &bull; Engineered for Students & Developers</p>
      </footer>
    </div>
  );
};

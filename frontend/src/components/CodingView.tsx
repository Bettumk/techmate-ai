import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { exportDocumentToPdf } from '../utils/exportPdf';
import {
  Code2,
  Bug,
  Zap,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Play,
  FileDown,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const CodingView: React.FC = () => {
  const [language, setLanguage] = useState('Python');
  const [activeTab, setActiveTab] = useState<'assistant' | 'sandbox'>('assistant');
  const [task, setTask] = useState<'generate' | 'debug' | 'optimize' | 'complexity'>('generate');
  const [inputCode, setInputCode] = useState('def solution(arr):\n    # Write or paste your logic here\n    pass');
  const [promptQuery, setPromptQuery] = useState('Implement Binary Search with step-by-step logic');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live Sandbox state
  const [sandboxLanguage, setSandboxLanguage] = useState<'python' | 'javascript'>('python');
  const [sandboxCode, setSandboxCode] = useState(
    `# TechMate Live Python Runner\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint("Calculating Fibonacci sequence:")\nfor i in range(10):\n    print(f"Fib({i}) = {fibonacci(i)}")`
  );
  const [sandboxInput, setSandboxInput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<{
    status: string;
    stdout: string;
    stderr: string;
    execution_time_ms: number;
  } | null>(null);

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

  const handleRunSandbox = async () => {
    setIsRunningCode(true);
    setSandboxOutput(null);
    try {
      const resp = await api.executeCode({
        code: sandboxCode,
        language: sandboxLanguage,
        input_data: sandboxInput,
      });
      setSandboxOutput(resp);
    } catch (err: any) {
      setSandboxOutput({
        status: 'error',
        stdout: '',
        stderr: err.message || 'Execution failed',
        execution_time_ms: 0,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    if (!result) return;
    exportDocumentToPdf({
      title: `${language} ${task.toUpperCase()} Notes`,
      subtitle: promptQuery || 'Coding & Algorithm Synthesis',
      category: 'Coding Workbench',
      content: result,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Coding & Debugging Studio</h1>
            <p className="text-xs text-slate-400">
              AI Code synthesis, root-cause debugging, Big-O optimization, and live execution sandbox
            </p>
          </div>
        </div>

        {/* Studio View Mode Switcher */}
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'assistant' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Code Mentor
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Live Code Runner
          </button>
        </div>
      </div>

      {activeTab === 'assistant' ? (
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
                  task === 'optimize' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Optimize
              </button>
              <button
                onClick={() => setTask('complexity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  task === 'complexity' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Big-O Complexity
              </button>
            </div>

            <form onSubmit={handleExecute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {task === 'generate' ? 'What do you want to build?' : 'Problem Description / Goal'}
                </label>
                <input
                  type="text"
                  value={promptQuery}
                  onChange={(e) => setPromptQuery(e.target.value)}
                  placeholder="e.g. Implement LRU Cache with O(1) get and put"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {task !== 'generate' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Code Snippet / Error</label>
                  <textarea
                    rows={8}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="Paste your source code or stack trace here..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Analysis
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>AI Solution & Breakdown</span>
              </span>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    title="Export as PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg bg-slate-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto prose prose-invert prose-xs max-w-none text-slate-300 space-y-3">
              {result ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 text-center space-y-2">
                  <Code2 className="w-10 h-10 stroke-1 opacity-40 text-cyan-400" />
                  <p className="text-xs">Configure your problem on the left and run the workbench.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIVE CODE RUNNER SANDBOX */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Sandbox Environment:</span>
                <select
                  value={sandboxLanguage}
                  onChange={(e) => {
                    const lang = e.target.value as 'python' | 'javascript';
                    setSandboxLanguage(lang);
                    if (lang === 'javascript') {
                      setSandboxCode(`// TechMate Live JavaScript Runner\nfunction quicksort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[arr.length - 1];\n  const left = arr.filter((x, i) => x <= pivot && i < arr.length - 1);\n  const right = arr.filter(x => x > pivot);\n  return [...quicksort(left), pivot, ...quicksort(right)];\n}\n\nconst sample = [64, 34, 25, 12, 22, 11, 90];\nconsole.log("Original Array:", sample);\nconsole.log("Sorted Array:  ", quicksort(sample));`);
                    } else {
                      setSandboxCode(`# TechMate Live Python Runner\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint("Calculating Fibonacci sequence:")\nfor i in range(10):\n    print(f"Fib({i}) = {fibonacci(i)}")`);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                </select>
              </div>

              <button
                onClick={handleRunSandbox}
                disabled={isRunningCode}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isRunningCode ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Run Code</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-xs font-mono text-slate-400">Editor</label>
              <textarea
                rows={14}
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                className="w-full flex-1 p-4 font-mono text-xs rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Standard Input (stdin, optional)</label>
              <input
                type="text"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="Data sent to input() / prompt()..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">Terminal Output</span>
              </div>

              {sandboxOutput && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{sandboxOutput.execution_time_ms} ms</span>
                  </span>

                  {sandboxOutput.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Exited 0
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-900/60 text-rose-300 border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> {sandboxOutput.status.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 p-2">
              {isRunningCode ? (
                <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Executing sandbox process...</span>
                </div>
              ) : sandboxOutput ? (
                <div className="space-y-2">
                  {sandboxOutput.stdout && (
                    <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{sandboxOutput.stdout}</pre>
                  )}
                  {sandboxOutput.stderr && (
                    <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
                      {sandboxOutput.stderr}
                    </pre>
                  )}
                  {!sandboxOutput.stdout && !sandboxOutput.stderr && (
                    <span className="text-slate-500 italic">(Process completed with empty stdout)</span>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-16 space-y-1">
                  <Terminal className="w-8 h-8 opacity-40" />
                  <p className="text-xs">Click "Run Code" to compile and execute in the sandbox.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

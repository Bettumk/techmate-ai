import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { exportDocumentToPdf } from '../utils/exportPdf';
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';

export const StudyExamView: React.FC = () => {
  const [subject, setSubject] = useState('Database Management Systems (DBMS)');
  const [topic, setTopic] = useState('Normalization and Normal Forms (1NF, 2NF, 3NF, BCNF)');
  const [marks, setMarks] = useState<number>(15);
  const [difficulty, setDifficulty] = useState('Medium');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const subjectsList = [
    'Database Management Systems (DBMS)',
    'Operating Systems (OS)',
    'Computer Networks (CN)',
    'Object-Oriented Programming (OOP)',
    'Software Engineering & Agile',
    'Compiler Design',
    'Artificial Intelligence & Machine Learning',
    'Cloud Computing & Distributed Systems',
    'Cybersecurity & Cryptography'
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const prompt = `Generate a ${marks}-mark exam answer for Subject: ${subject}, Topic: ${topic}. Structure strictly with 10 sections including definition, explanation, example, diagram, advantages, and conclusion.`;
      const res = await api.sendMessage({
        content: prompt,
        mode: 'STUDY',
        exam_params: {
          subject,
          topic,
          marks,
          difficulty
        }
      });
      setResult(res.content);
    } catch (err: any) {
      setResult(`### Error\nFailed to generate exam answer: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyContent = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CSE Study & University Exam Prep</h1>
            <p className="text-xs text-slate-400">
              Generate 5, 10, or 15-mark university-structured answers with diagrams & examples
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Exam Rubric Formatter</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 h-fit">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Question Parameters</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Question</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g. Normalization (1NF, 2NF, 3NF, BCNF) or Deadlock Prevention"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Marks Weightage</label>
                <select
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value={5}>5 Marks (Concise)</option>
                  <option value={10}>10 Marks (Standard)</option>
                  <option value={15}>15 Marks (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Easy">Foundation</option>
                  <option value="Medium">University Standard</option>
                  <option value="Hard">Advanced / Rigorous</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Formulating Answer...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {marks}-Mark Answer</span>
                </>
              )}
            </button>
          </form>

          {/* Quick topic tags */}
          <div className="pt-2">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">Popular Exam Topics:</p>
            <div className="flex flex-wrap gap-1.5">
              {['Normalization', 'Deadlocks', 'TCP vs UDP', 'B-Trees', 'Paging & Segmentation', 'ACID Properties'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Formatted Exam Paper Answer</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!result) return;
                  exportDocumentToPdf({
                    title: `${subject} - ${topic}`,
                    subtitle: `${marks} Marks Comprehensive Exam Answer | Difficulty: ${difficulty}`,
                    category: 'University Examination Answer',
                    content: result,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs text-emerald-400 border border-emerald-500/30 transition-colors"
                title="Download formatted printable PDF"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={copyContent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></span>
                <p className="text-xs text-slate-400">TechMate Exam Agent is building your 10-section response...</p>
              </div>
            ) : result ? (
              <div className="markdown-body text-xs md:text-sm leading-relaxed p-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <BookOpen className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-xs">Select your subject and topic, then click Generate to get an exam-ready breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

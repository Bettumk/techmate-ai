import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InterviewSession } from '../types';
import {
  Mic,
  Sparkles,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  ThumbsUp,
  Brain
} from 'lucide-react';

export const InterviewView: React.FC = () => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [role, setRole] = useState('Software Developer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [answerInput, setAnswerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);

  const roles = [
    'Software Developer',
    'Python Developer',
    'Frontend Developer',
    'Backend Developer',
    'AI/ML Engineer'
  ];

  const fetchPastSessions = async () => {
    try {
      const data = await api.getInterviewSessions();
      setPastSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPastSessions();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newSession = await api.startInterview({
        role,
        difficulty,
        num_questions: numQuestions,
      });
      setSession(newSession);
      setAnswerInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !answerInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await api.submitInterviewAnswer(session.id, answerInput.trim());
      setSession(updated);
      setAnswerInput('');
      fetchPastSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Interactive Mock Interview Simulation</h1>
            <p className="text-xs text-slate-400">
              Role-based technical & behavioral rounds with real-time scoring and constructive critique
            </p>
          </div>
        </div>

        {session && (
          <button
            onClick={() => setSession(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>End / New Session</span>
          </button>
        )}
      </div>

      {!session ? (
        /* Configuration / Start View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 lg:col-span-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-rose-400" />
              <span>Configure Mock Session</span>
            </h2>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Engineering Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="Junior">Junior / Entry Level</option>
                    <option value="Medium">Mid-Level / Standard</option>
                    <option value="Senior">Senior / Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value={3}>3 Questions (Quick Sprint)</option>
                    <option value={5}>5 Questions (Standard Round)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Setting Up Interviewer...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Begin Mock Interview</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Sessions List */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Past Sessions ({pastSessions.length})</span>
            </h3>

            {pastSessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous mock interviews yet.</p>
            ) : (
              <div className="space-y-2">
                {pastSessions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSession(s)}
                    className="cursor-pointer p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">{s.role}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        s.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {s.transcript.length} turns evaluated &bull; {s.difficulty}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Interview Interactive Flow */
        <div className="space-y-6">
          {/* Progress Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">{session.role} ({session.difficulty})</span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-400">
                Question {Math.min(session.current_index + 1, session.total_questions)} of {session.total_questions}
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              session.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {session.status === 'completed' ? 'Interview Completed' : 'In Progress'}
            </span>
          </div>

          {/* Current Question Box (if in progress) */}
          {session.status === 'in_progress' && session.current_question && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Technical Interviewer Asks:
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {session.current_question.type}
                </span>
              </div>

              <p className="text-base font-semibold text-white leading-relaxed">
                "{session.current_question.question}"
              </p>

              <form onSubmit={handleSubmitAnswer} className="space-y-3 pt-2">
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  rows={4}
                  placeholder="Formulate your technical explanation here (mention key principles, mechanism, and an example)..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !answerInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Evaluating Response...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Final Summary Card (if completed) */}
          {session.status === 'completed' && session.final_evaluation && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Award className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Interview Performance Summary</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <p className="text-[11px] text-slate-400">Average Score</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {session.final_evaluation.overall_score} / 10
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center sm:col-span-2">
                  <p className="text-[11px] text-slate-400">Hiring Committee Verdict</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {session.final_evaluation.verdict}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{session.final_evaluation.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transcript History */}
          {session.transcript.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Evaluation Log ({session.transcript.length} Questions)</h3>
              <div className="space-y-4">
                {session.transcript.map((t, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-300">Question {idx + 1}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-950 text-emerald-400 border border-emerald-500/30">
                        Score: {t.score} / 10
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium">"{t.question}"</p>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                      <p className="text-[11px] font-semibold text-slate-400 mb-1">Your Response:</p>
                      <p>{t.user_answer}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                      <p className="text-[11px] font-semibold text-blue-400">Interviewer Feedback:</p>
                      <p>{t.feedback}</p>
                      {t.model_answer && (
                        <p className="mt-2 text-[11px] text-slate-400 italic">
                          <strong className="text-slate-300">Model Formulation:</strong> {t.model_answer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

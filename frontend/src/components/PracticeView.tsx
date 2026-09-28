import React, { useState } from 'react';
import { api } from '../services/api';
import { PracticeSession } from '../types';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Layers
} from 'lucide-react';

export const PracticeView: React.FC = () => {
  const [topic, setTopic] = useState('Data Structures');
  const [difficulty, setDifficulty] = useState('Medium');
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems'];

  const handleStartPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSelectedAnswers({});
    try {
      const data = await api.startPractice({
        topic,
        difficulty,
        count: 4,
      });
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qid: string, optIdx: number) => {
    if (session?.status === 'completed') return;
    setSelectedAnswers({ ...selectedAnswers, [qid]: optIdx });
  };

  const handleSubmitQuiz = async () => {
    if (!session) return;
    setIsSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([id, selected_option]) => ({
        id,
        selected_option,
      }));
      const evaluated = await api.submitPracticeAnswers(session.id, answers);
      setSession(evaluated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Practice Arena & Technical Quizzes</h1>
            <p className="text-xs text-slate-400">
              Interactive multiple-choice and conceptual problems with instant feedback
            </p>
          </div>
        </div>

        {session && (
          <button
            onClick={() => setSession(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
        )}
      </div>

      {!session ? (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Select Practice Domain</span>
          </h2>

          <form onSubmit={handleStartPractice} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="Foundation">Foundation</option>
                <option value="Medium">Standard University</option>
                <option value="Advanced">Advanced Coding Test</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating Question Set...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Practice Session</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quiz Header & Score Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              {session.topic} ({session.difficulty})
            </span>

            {session.status === 'completed' && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Score: {session.score} / {session.total} ({Math.round((session.score / session.total) * 100)}%)
              </span>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {(session.results || session.questions).map((q, idx) => {
              const selectedOpt = selectedAnswers[q.id];
              const isFinished = session.status === 'completed';

              return (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400">Question {idx + 1}</span>
                    {isFinished && (
                      <span className={`text-xs font-bold flex items-center gap-1 ${q.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {q.is_correct ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-white">{q.question}</p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = selectedOpt === oIdx || q.selected_option === oIdx;
                      const isCorrect = isFinished && q.correct_option === oIdx;

                      let optClasses = 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700';
                      if (isFinished) {
                        if (isCorrect) {
                          optClasses = 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200 font-semibold';
                        } else if (isChosen && !q.is_correct) {
                          optClasses = 'border-rose-500/80 bg-rose-950/30 text-rose-200';
                        }
                      } else if (isChosen) {
                        optClasses = 'border-amber-500 bg-amber-950/30 text-amber-200 font-medium';
                      }

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`cursor-pointer p-3 rounded-xl border text-xs transition-all flex items-center gap-3 ${optClasses}`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 ${
                            isChosen ? 'border-amber-400 text-amber-400 font-bold' : 'border-slate-700 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isFinished && q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                      <strong className="text-slate-200">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {session.status !== 'completed' && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Answers & Review'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

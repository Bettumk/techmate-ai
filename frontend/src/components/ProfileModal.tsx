import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Save, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    education_level: 'B.Tech CSE',
    primary_language: 'Python',
    experience_level: 'Beginner',
    career_goal: 'Software Engineer',
    preferred_style: 'Practical with Code',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        education_level: user.profile.education_level || 'B.Tech CSE',
        primary_language: user.profile.primary_language || 'Python',
        experience_level: user.profile.experience_level || 'Beginner',
        career_goal: user.profile.career_goal || 'Software Engineer',
        preferred_style: user.profile.preferred_style || 'Practical with Code',
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(profile);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Learner Profile & Personalization</h2>
            <p className="text-xs text-slate-400">TechMate adapts its explanations to your background</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Education Level</label>
            <select
              value={profile.education_level}
              onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="B.Tech / B.E. Computer Science">B.Tech / B.E. Computer Science</option>
              <option value="BCA / MCA">BCA / MCA</option>
              <option value="Information Science / IT">Information Science / IT</option>
              <option value="High School / Pre-University">High School / Pre-University</option>
              <option value="Self-Taught / Bootcamp Student">Self-Taught / Bootcamp Student</option>
              <option value="Working Software Professional">Working Software Professional</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Primary Language</label>
              <select
                value={profile.primary_language}
                onChange={(e) => setProfile({ ...profile, primary_language: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="JavaScript / TypeScript">JavaScript / TypeScript</option>
                <option value="C">C</option>
                <option value="Go / Rust">Go / Rust</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Experience Level</label>
              <select
                value={profile.experience_level}
                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Beginner">Beginner (Foundations)</option>
                <option value="Intermediate">Intermediate (Projects & DSA)</option>
                <option value="Advanced">Advanced (Systems & Optimization)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Career Goal</label>
            <select
              value={profile.career_goal}
              onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
              <option value="Data Analyst / Scientist">Data Analyst / Scientist</option>
              <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Learning Style</label>
            <select
              value={profile.preferred_style}
              onChange={(e) => setProfile({ ...profile, preferred_style: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Practical with Code">Practical with Code Examples</option>
              <option value="Exam-Oriented (Structured & Marks)">Exam-Oriented (Structured & Marks)</option>
              <option value="Conceptual & Intuition First">Conceptual & Intuition First</option>
              <option value="Interview-Focused (Big-O & Trade-offs)">Interview-Focused (Big-O & Trade-offs)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Preferences Saved!
                </>
              ) : isSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

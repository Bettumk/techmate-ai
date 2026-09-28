import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { Project } from '../types';
import {
  FolderGit2,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Database,
  Server,
  HelpCircle,
  FolderTree,
  Send
} from 'lucide-react';

interface ProjectViewProps {
  onOpenProjectInChat?: (project: Project) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ onOpenProjectInChat }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStack, setNewStack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'apis' | 'viva'>('architecture');
  const [queryInput, setQueryInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const proj = await api.createProject({
        title: newTitle.trim(),
        description: newDesc.trim(),
        tech_stack: newStack.trim(),
      });
      setProjects([proj, ...projects]);
      setSelectedProject(proj);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewStack('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    try {
      await api.deleteProject(id);
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      setSelectedProject(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskProjectAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || !selectedProject) return;

    setIsAsking(true);
    setChatResponse(null);

    try {
      const res = await api.sendMessage({
        content: queryInput.trim(),
        mode: 'PROJECT',
        project_id: selectedProject.id,
      });
      setChatResponse(res.content);
      setQueryInput('');
    } catch (err: any) {
      setChatResponse(`Failed to process: ${err.message}`);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Software Project Studio</h1>
            <p className="text-xs text-slate-400">
              System architecture, SQL database schemas, REST APIs, and Viva Voce defense
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Sidebar List */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Your Projects ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No projects yet. Click '+ New Project' above.</p>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => {
                  const isSelected = selectedProject?.id === proj.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setSelectedProject(proj);
                        setChatResponse(null);
                      }}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <p className="text-xs font-semibold truncate">{proj.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{proj.tech_stack || 'Full Stack'}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(proj.id);
                        }}
                        className="p-1 hover:text-red-400 text-slate-400 transition-colors ml-2"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Project Details & Blueprint */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{selectedProject.title}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {selectedProject.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedProject.description || 'Full-stack software architecture and schema.'}
                </p>
                <p className="text-[11px] text-purple-300 font-mono mt-1">
                  Stack: {selectedProject.tech_stack || 'Python, FastAPI, PostgreSQL, React'}
                </p>
              </div>

              {/* Blueprint Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                {[
                  { key: 'architecture', label: 'Architecture', icon: <Layers className="w-3.5 h-3.5" /> },
                  { key: 'schema', label: 'Database Schema', icon: <Database className="w-3.5 h-3.5" /> },
                  { key: 'apis', label: 'REST APIs', icon: <Server className="w-3.5 h-3.5" /> },
                  { key: 'viva', label: 'Viva Voce Q&A', icon: <HelpCircle className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                      activeTab === t.key
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto">
                {activeTab === 'architecture' && (
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">// 3-Tier Layered Architecture Blueprint</p>
                    <pre className="text-slate-300">{`[Client Devices / RTSP Feeds]
         |
         v
[API Gateway / Nginx Reverse Proxy]
         |
         +--> [FastAPI Core Application Service]
         |          |
         |          +--> [Model Inference Pipeline (ArcFace/ONNX)]
         |          |
         |          +--> [Asynchronous Worker Queue]
         |
         v
[Database Engine: PostgreSQL (pgvector)] <--> [Cache: Redis Session Store]`}</pre>
                  </div>
                )}

                {activeTab === 'schema' && (
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">// Relational Schema with Constraints</p>
                    <pre className="text-cyan-300">{`CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'student'
);

CREATE TABLE attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PRESENT'
);`}</pre>
                  </div>
                )}

                {activeTab === 'apis' && (
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">// Standard RESTful Contract Specifications</p>
                    <pre className="text-emerald-300">{`POST /api/v1/auth/token             -> Issue JWT bearer token
POST /api/v1/recognition/frame      -> Ingest webcam frame and match vector
GET  /api/v1/attendance/summary     -> Daily/weekly attendance ledger
GET  /api/v1/reports/export.csv     -> Download semester audit report`}</pre>
                  </div>
                )}

                {activeTab === 'viva' && (
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">// Common External Examiner Viva Questions</p>
                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <strong className="text-white">Q1: How do you handle concurrency when 100 students arrive at once?</strong>
                        <p className="text-slate-400 mt-0.5">A: We use FastAPI's asynchronous event loop combined with an in-memory queue to decouple frame ingestion from vector matching.</p>
                      </div>
                      <div>
                        <strong className="text-white">Q2: Why choose PostgreSQL over MongoDB for this project?</strong>
                        <p className="text-slate-400 mt-0.5">A: Academic attendance ledgers require strict ACID guarantees and foreign key referential integrity between courses and student rosters.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ask Project Agent Input */}
              <div className="pt-2">
                <form onSubmit={handleAskProjectAgent} className="flex gap-2">
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder={`Ask TechMate specifically about ${selectedProject.title}... (e.g. Which model should I use?)`}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !queryInput.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isAsking ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Ask Agent</span>
                  </button>
                </form>
              </div>

              {/* Chat Response Display */}
              {chatResponse && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-xs markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {chatResponse}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
              <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Select an existing project or create one to view architectural blueprints.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Start New Software Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI-Based Smart Attendance System"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Problem Statement / Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Briefly describe the purpose and features of this project"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Technology Stack</label>
                <input
                  type="text"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  placeholder="e.g. Python, OpenCV, FastAPI, React, PostgreSQL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-500/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

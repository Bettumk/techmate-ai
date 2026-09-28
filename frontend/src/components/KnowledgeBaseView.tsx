import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import {
  Database,
  Upload,
  FileText,
  Trash2,
  Search,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Send,
  Layers
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResult, setQueryResult] = useState<{ answer: string; citations: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const newDoc = await api.uploadDocument(file);
      setDocuments([newDoc, ...documents]);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Delete this document and its indexed vectors?')) return;
    try {
      await api.deleteDocument(id);
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQueryRAG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setQueryResult(null);
    try {
      const res = await api.queryDocuments(searchQuery.trim());
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({
        answer: `Query error: ${err.message}`,
        citations: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Base & RAG Index</h1>
            <p className="text-xs text-slate-400">
              Upload PDF notes, syllabus books, and docs to query with vector embeddings & semantic search
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Indexing...' : 'Upload Document'}</span>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Uploaded Documents List */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Indexed Documents</span>
            <span className="text-slate-400 font-mono">({documents.length})</span>
          </h2>

          {documents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No documents indexed.</p>
              <p className="text-[11px] text-slate-400 mt-1">Upload a PDF, DOCX, or TXT file to enable semantic RAG.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold text-white truncate">{doc.filename}</p>
                    <p className="text-[10px] text-cyan-400 font-mono">
                      {doc.chunk_count} chunks indexed &bull; {Math.round(doc.file_size / 1024)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1 hover:text-red-400 text-slate-400 transition-colors ml-2"
                    title="Remove document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Semantic Query & RAG Q&A Area */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col min-h-[450px]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Semantic Search & Document Q&A</span>
          </h3>

          <form onSubmit={handleQueryRAG} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a question about your uploaded documents (e.g. Explain chapter 3 or Important questions)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSearching ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Query RAG</span>
            </button>
          </form>

          {/* Results Display */}
          <div className="flex-1 overflow-y-auto pt-2">
            {isSearching ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <span className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></span>
                <p className="text-xs text-slate-400">Computing vector similarities across knowledge chunks...</p>
              </div>
            ) : queryResult ? (
              <div className="space-y-4">
                <div className="markdown-body text-xs md:text-sm leading-relaxed p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {queryResult.answer}
                  </ReactMarkdown>
                </div>

                {queryResult.citations && queryResult.citations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Verified Document Citations:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {queryResult.citations.map((cite: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                          <p className="font-semibold text-cyan-300 truncate">{cite.filename} (Chunk #{cite.chunk_index})</p>
                          <p className="mt-1 line-clamp-2 italic">"{cite.excerpt}"</p>
                          <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono">
                            Relevance: {Math.round(cite.score * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <Database className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-xs">Upload your study materials and ask questions to retrieve verified answers with citations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

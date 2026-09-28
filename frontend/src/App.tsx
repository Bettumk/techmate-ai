import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AppMode, Conversation, Message, Project } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ChatView } from './components/ChatView';
import { StudyExamView } from './components/StudyExamView';
import { CodingView } from './components/CodingView';
import { ProjectView } from './components/ProjectView';
import { CareerView } from './components/CareerView';
import { ResumeView } from './components/ResumeView';
import { InterviewView } from './components/InterviewView';
import { PracticeView } from './components/PracticeView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentMode, setCurrentMode] = useState<AppMode>('AUTO');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  // Load conversations and projects when user logs in
  const loadUserData = async () => {
    if (!isAuthenticated) return;
    try {
      const [convs, projs] = await Promise.all([
        api.getConversations(),
        api.getProjects()
      ]);
      setConversations(convs);
      setProjects(projs);
      if (convs.length > 0 && !activeConversationId) {
        // If there are conversations, don't force-select immediately so user sees dashboard first
      }
    } catch (err) {
      console.error('Failed to load user data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      setConversations([]);
      setProjects([]);
      setActiveConversationId(undefined);
      setMessages([]);
      setShowDashboard(true);
    }
  }, [isAuthenticated]);

  const handleSelectConversation = async (id: string) => {
    try {
      setActiveConversationId(id);
      setShowDashboard(false);
      const data = await api.getConversation(id);
      setMessages(data.messages);
      setCurrentMode((data.conversation.mode as AppMode) || 'AUTO');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setCurrentMode('AUTO');
    setShowDashboard(false);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await api.renameConversation(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(undefined);
        setMessages([]);
        setShowDashboard(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (content: string, mode: AppMode) => {
    if (!content.trim()) return;

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || '',
      role: 'user',
      content,
      mode,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsChatLoading(true);
    setShowDashboard(false);

    try {
      const resp = await api.sendMessage({
        content,
        conversation_id: activeConversationId,
        mode,
      });

      if (!activeConversationId) {
        setActiveConversationId(resp.conversation_id);
      }

      setMessages((prev) => [...prev, resp]);
      // Refresh conversations list to update titles/timestamps
      const updatedConvs = await api.getConversations();
      setConversations(updatedConvs);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        conversation_id: activeConversationId || '',
        role: 'assistant',
        content: `TechMate is temporarily unable to process your request. Please try again. (${err.message})`,
        mode,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
    if (mode === 'AUTO') {
      if (messages.length === 0) {
        setShowDashboard(true);
      }
    } else {
      setShowDashboard(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <span className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></span>
        <p className="text-sm font-semibold text-white">Initializing TechMate AI...</p>
        <p className="text-xs text-slate-400 mt-1">Learn. Build. Code. Grow.</p>
      </div>
    );
  }

  // If user is not authenticated, display Landing Page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onStartLearning={() => setIsAuthModalOpen(true)}
          onExploreFeature={(mode) => {
            setCurrentMode(mode);
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentMode={currentMode}
          onSelectMode={handleModeChange}
          activeConversationId={activeConversationId}
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        <main className="flex-1 flex flex-col bg-slate-950 overflow-y-auto">
          {currentMode === 'AUTO' && showDashboard ? (
            <Dashboard
              onSelectMode={handleModeChange}
              conversations={conversations}
              projects={projects}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
            />
          ) : currentMode === 'AUTO' ? (
            <ChatView
              messages={messages}
              isLoading={isChatLoading}
              onSendMessage={handleSendMessage}
              currentMode={currentMode}
              onModeChange={handleModeChange}
            />
          ) : currentMode === 'STUDY' ? (
            <StudyExamView />
          ) : currentMode === 'CODING' ? (
            <CodingView />
          ) : currentMode === 'PROJECT' ? (
            <ProjectView />
          ) : currentMode === 'CAREER' ? (
            <CareerView />
          ) : currentMode === 'RESUME' ? (
            <ResumeView />
          ) : currentMode === 'INTERVIEW' ? (
            <InterviewView />
          ) : currentMode === 'PRACTICE' ? (
            <PracticeView />
          ) : currentMode === 'KNOWLEDGE_BASE' ? (
            <KnowledgeBaseView />
          ) : (
            <ChatView
              messages={messages}
              isLoading={isChatLoading}
              onSendMessage={handleSendMessage}
              currentMode={currentMode}
              onModeChange={handleModeChange}
            />
          )}
        </main>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

import {
  User,
  UserProfile,
  Conversation,
  Message,
  Project,
  DocumentItem,
  InterviewSession,
  PracticeSession
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('techmate_token');
  }

  public setToken(token: string) {
    localStorage.setItem('techmate_token', token);
  }

  public clearToken() {
    localStorage.removeItem('techmate_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `Request failed (${response.status})`;
      try {
        const errData = await response.json();
        errorMsg = errData.detail || errorMsg;
      } catch {
        // ignore fallback
      }
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async register(data: { email: string; password: string; full_name: string }) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async demoLogin() {
    const res = await this.request<{ access_token: string; user: User }>('/auth/demo', {
      method: 'POST',
    });
    this.setToken(res.access_token);
    return res;
  }

  async googleLogin(data: { credential?: string; email?: string; full_name?: string }) {
    const res = await this.request<{ access_token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Profile
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/profile');
  }

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    return this.request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/conversations');
  }

  async createConversation(data: { title?: string; mode?: string }): Promise<Conversation> {
    return this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    return this.request<{ conversation: Conversation; messages: Message[] }>(`/conversations/${id}`);
  }

  async renameConversation(id: string, title: string): Promise<{ success: boolean; title: string }> {
    return this.request<{ success: boolean; title: string }>(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat
  async sendMessage(data: {
    content: string;
    conversation_id?: string;
    mode?: string;
    project_id?: string;
    exam_params?: Record<string, any>;
  }): Promise<Message> {
    return this.request<Message>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async createProject(data: { title: string; description?: string; tech_stack?: string }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents & RAG
  async getDocuments(): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>('/documents');
  }

  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async queryDocuments(query: string, document_ids?: string[]): Promise<{ answer: string; citations: any[] }> {
    return this.request<{ answer: string; citations: any[] }>('/documents/query', {
      method: 'POST',
      body: JSON.stringify({ query, document_ids }),
    });
  }

  // Interview
  async startInterview(data: { role: string; difficulty: string; num_questions?: number }): Promise<InterviewSession> {
    return this.request<InterviewSession>('/interview/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitInterviewAnswer(session_id: string, answer: string): Promise<InterviewSession> {
    return this.request<InterviewSession>('/interview/answer', {
      method: 'POST',
      body: JSON.stringify({ session_id, answer }),
    });
  }

  async getInterviewSessions(): Promise<InterviewSession[]> {
    return this.request<InterviewSession[]>('/interview/sessions');
  }

  // Practice
  async startPractice(data: { topic: string; difficulty: string; question_type?: string; count?: number }): Promise<PracticeSession> {
    return this.request<PracticeSession>('/practice/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitPracticeAnswers(session_id: string, answers: Array<{ id: string; selected_option: number }>): Promise<PracticeSession> {
    return this.request<PracticeSession>('/practice/submit', {
      method: 'POST',
      body: JSON.stringify({ session_id, answers }),
    });
  }

  async getPracticeSessions(): Promise<any[]> {
    return this.request<any[]>('/practice/sessions');
  }
}

export const api = new ApiClient();

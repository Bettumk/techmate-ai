export type AppMode =
  | 'AUTO'
  | 'CODING'
  | 'STUDY'
  | 'PROJECT'
  | 'CAREER'
  | 'RESUME'
  | 'INTERVIEW'
  | 'PRACTICE'
  | 'KNOWLEDGE_BASE';

export interface UserProfile {
  education_level?: string;
  primary_language?: string;
  experience_level?: string;
  career_goal?: string;
  preferred_style?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile?: UserProfile;
}

export interface Conversation {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface MessageMetadata {
  language?: string;
  experience_level?: string;
  subject?: string;
  topic?: string;
  marks?: number;
  difficulty?: string;
  active_project?: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode?: string;
  intent?: string;
  metadata?: MessageMetadata;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  status: string;
  data: {
    architecture?: string;
    database?: string;
    modules?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  difficulty: string;
  current_index: number;
  total_questions: number;
  status: 'in_progress' | 'completed';
  current_question?: {
    index: number;
    question: string;
    type: string;
  };
  transcript: Array<{
    question_index: number;
    question: string;
    user_answer: string;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    model_answer: string;
  }>;
  final_evaluation?: {
    overall_score: number;
    verdict: string;
    summary: string;
    total_answered: number;
  };
  created_at: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  selected_option?: number;
  correct_option?: number;
  is_correct?: boolean;
  explanation?: string;
}

export interface PracticeSession {
  id: string;
  topic: string;
  difficulty: string;
  question_type: string;
  questions: PracticeQuestion[];
  score: number;
  total: number;
  status: 'in_progress' | 'completed';
  results?: PracticeQuestion[];
}

export type UserRole = 'admin' | 'trainee';
export type UserStatus = 'active' | 'blocked';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  display_order: number;
  cover_url: string;
  created_at: string;
}

export type ContentType = 'video' | 'pdf' | 'text';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description: string;
  content_type: ContentType;
  content_url: string;
  content_text: string;
  video_url: string;
  image_url: string;
  document_url: string;
  display_order: number;
  created_at: string;
  published: boolean;
  quiz_data: QuizQuestion[];
}

export interface SliderImage {
  id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  trainee_id: string;
  lesson_id: string;
  completed: boolean;
  updated_at: string;
}

export interface AppSettings {
  id: number;
  logo_url: string;
  updated_at: string;
}

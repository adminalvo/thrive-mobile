import { UserRole, UserProfileRow } from './database.types';

export interface UserSession {
  userId: string;
  email: string;
  role: UserRole;
  profile: UserProfileRow;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
}

export type SupportedLanguage = 'az' | 'en' | 'ru';

export interface User {
  id: string;
  name: string;
  ntfyTopic: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  dueDate: string | null;
  projectId: string | null;
  completed: boolean;
  notificationEnabled: boolean;
  notificationSent: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

export type Screen =
  | { type: 'home' }
  | { type: 'taskList'; filter?: FilterType }
  | { type: 'addTask'; projectId?: string }
  | { type: 'editTask'; taskId: string }
  | { type: 'projects' }
  | { type: 'projectDetail'; projectId: string }
  | { type: 'settings' };

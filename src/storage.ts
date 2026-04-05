import { User, Task, Project } from './types';

const STORAGE_KEYS = {
  USERS: 'checklist_users',
  TASKS: 'checklist_tasks',
  PROJECTS: 'checklist_projects',
  ACTIVE_USER: 'checklist_active_user',
};

// Users
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getActiveUserId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
};

export const setActiveUserId = (userId: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId);
};

// Tasks
export const getTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Projects
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// Initialize default user if none exist
export const initializeStorage = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultUser: User = {
      id: crypto.randomUUID(),
      name: 'You',
      ntfyTopic: 'my-checklist-app',
    };
    saveUsers([defaultUser]);
    setActiveUserId(defaultUser.id);
  }
};

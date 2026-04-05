import { User, Task, Project } from './types';

// Sync data to backend
export const syncToSupabase = async (
  userId: string,
  tasks: Task[],
  projects: Project[],
  user?: User
): Promise<void> => {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, tasks, projects, user }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sync failed');
    }

    console.log('Data synced successfully');
  } catch (error) {
    console.error('Error syncing to backend:', error);
  }
};

// Load data from backend
export const loadFromSupabase = async (userId: string, user?: User): Promise<{ tasks: Task[], projects: Project[], user: User | null }> => {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, user }), // Pass user to create if it doesn't exist
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Load failed');
    }

    const data = await response.json();
    return {
      tasks: data.tasks || [],
      projects: data.projects || [],
      user: data.user || null
    };
  } catch (error) {
    console.error('Error loading from backend:', error);
    return { tasks: [], projects: [], user: null };
  }
};

// Trigger notification check
export const triggerNotificationCheck = async (): Promise<void> => {
  try {
    const response = await fetch('/supabase/functions/server/check-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to check notifications');
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

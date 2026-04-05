import { User, Task, Project } from './types';
import { supabase } from './supabaseClient';

// Sync data to Supabase backend
export const syncToSupabase = async (
  userId: string,
  tasks: Task[],
  projects: Project[],
  user?: User
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('sync', {
      body: { userId, tasks, projects, user },
    });

    if (error) {
      console.error('Failed to sync to Supabase:', error);
    }
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
  }
};

// Load data from Supabase
export const loadFromSupabase = async (userId: string): Promise<{ tasks: Task[], projects: Project[], user: User | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync', {
      body: { userId }, // Only userId means load operation
    });

    if (error) {
      console.error('Failed to load from Supabase:', error);
      return { tasks: [], projects: [], user: null };
    }

    return {
      tasks: data?.tasks || [],
      projects: data?.projects || [],
      user: data?.user || null
    };
  } catch (error) {
    console.error('Error loading from Supabase:', error);
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

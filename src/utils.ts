import { Task } from './types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';

  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

export const isTaskDueToday = (task: Task): boolean => {
  if (!task.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
};

export const isTaskDueTomorrow = (task: Task): boolean => {
  if (!task.dueDate) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(task.dueDate);
  return (
    dueDate.getDate() === tomorrow.getDate() &&
    dueDate.getMonth() === tomorrow.getMonth() &&
    dueDate.getFullYear() === tomorrow.getFullYear()
  );
};

export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const sendNtfyNotification = async (
  topic: string,
  title: string,
  message: string
): Promise<void> => {
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      body: message,
      headers: {
        Title: title,
        Priority: 'default',
      },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

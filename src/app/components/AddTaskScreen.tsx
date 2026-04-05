import { useState, useEffect } from 'react';
import { User, Task, Project, Screen } from '../types';

interface AddTaskScreenProps {
  user: User;
  task?: Task;
  projects: Project[];
  defaultProjectId?: string;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDelete?: (taskId: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function AddTaskScreen({
  user,
  task,
  projects,
  defaultProjectId,
  onSave,
  onDelete,
  onNavigate,
}: AddTaskScreenProps) {
  const [name, setName] = useState(task?.name || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [projectId, setProjectId] = useState(task?.projectId || defaultProjectId || '');
  const [notificationEnabled, setNotificationEnabled] = useState(
    task?.notificationEnabled ?? true
  );

  const userProjects = projects.filter((p) => p.userId === user.id);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      userId: user.id,
      name: name.trim(),
      dueDate: dueDate || null,
      projectId: projectId || null,
      completed: task?.completed || false,
      notificationEnabled,
      notificationSent: task?.notificationSent || false,
    });

    onNavigate({ type: 'taskList' });
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onNavigate({ type: 'taskList' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="sticky top-0 bg-[#F5F0E8] border-b border-[#1C1C1C]/10 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate({ type: 'taskList' })}
            style={{ fontSize: '16px', color: '#1C1C1C' }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1C1C1C' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h1>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              fontSize: '16px',
              color: name.trim() ? '#E8533A' : '#9ca3af',
              fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-5">
        {/* Task name */}
        <div>
          <label
            className="block mb-3"
            style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Task name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What do you need to do?"
            className="w-full px-5 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-[#E8533A] outline-none transition-all shadow-sm focus:shadow-md"
            style={{ fontSize: '16px', color: '#1C1C1C', letterSpacing: '-0.01em' }}
            autoFocus
          />
        </div>

        {/* Due date */}
        <div>
          <label
            className="block mb-3"
            style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-5 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-[#E8533A] outline-none transition-all shadow-sm focus:shadow-md"
            style={{ fontSize: '16px', color: '#1C1C1C' }}
          />
        </div>

        {/* Project */}
        <div>
          <label
            className="block mb-3"
            style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Project (optional)
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-5 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-[#E8533A] outline-none transition-all shadow-sm focus:shadow-md"
            style={{ fontSize: '16px', color: '#1C1C1C' }}
          >
            <option value="">No Project</option>
            {userProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notification toggle */}
        <div className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm">
          <div>
            <div style={{ fontSize: '16px', color: '#1C1C1C', letterSpacing: '-0.01em' }}>
              Reminder notification
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              Sent 24 hours before due date
            </div>
          </div>
          <button
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className="w-12 h-6 rounded-full transition-all relative shadow-sm"
            style={{
              backgroundColor: notificationEnabled ? '#E8533A' : '#d1d5db',
            }}
          >
            <div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
              style={{
                left: notificationEnabled ? '26px' : '2px',
              }}
            />
          </button>
        </div>

        {/* ntfy.sh topic info */}
        <div className="p-5 bg-white rounded-3xl shadow-sm">
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ntfy.sh topic
          </div>
          <div style={{ fontSize: '18px', color: '#E8533A', fontWeight: 500, letterSpacing: '-0.01em' }}>
            {user.ntfyTopic}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', lineHeight: '1.5' }}>
            Subscribe to this topic in the ntfy app to receive notifications
          </div>
        </div>

        {/* Delete button */}
        {task && onDelete && (
          <button
            onClick={handleDelete}
            className="w-full py-4 rounded-3xl border-2 border-[#E8533A] hover:bg-[#E8533A] hover:text-[#F5F0E8] transition-all shadow-sm hover:shadow-md"
            style={{ fontSize: '16px', color: '#E8533A', fontWeight: 500, letterSpacing: '-0.01em' }}
          >
            Delete Task
          </button>
        )}
      </div>
    </div>
  );
}

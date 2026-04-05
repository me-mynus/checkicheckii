import { useState } from 'react';
import { User, Task, Project, Screen } from '../../types';
import { TaskTile } from './TaskTile';
import { Home, CheckSquare, Folder, User as UserIcon } from 'lucide-react';

interface ProjectDetailScreenProps {
  user: User;
  project: Project;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (taskId: string) => void;
  onNavigate: (screen: Screen) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export function ProjectDetailScreen({
  user,
  project,
  tasks,
  projects,
  onToggleComplete,
  onNavigate,
  onDeleteProject,
  onRenameProject,
}: ProjectDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);

  const projectTasks = tasks.filter(
    (t) => t.projectId === project.id && t.userId === user.id
  );
  const total = projectTasks.length;
  const completed = projectTasks.filter((t) => t.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleSaveRename = () => {
    if (editedName.trim() && editedName !== project.name) {
      onRenameProject(project.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete project "${project.name}" and all its tasks?`)) {
      onDeleteProject(project.id);
      onNavigate({ type: 'projects' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="sticky top-0 bg-[#F5F0E8] border-b border-[#1C1C1C]/10 p-6">
        {/* Top navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
          >
            <Home size={20} color="#6b7280" />
          </button>
          <div className="flex gap-8">
            <button
              onClick={() => onNavigate({ type: 'taskList' })}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
            >
              <CheckSquare size={20} color="#6b7280" />
              <span style={{ fontSize: '10px', color: '#6b7280' }}>Tasks</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#E8533A]/10">
              <Folder size={20} color="#E8533A" />
              <span style={{ fontSize: '10px', color: '#E8533A', fontWeight: 500 }}>Projects</span>
            </button>
            <button
              onClick={() => onNavigate({ type: 'settings' })}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
            >
              <UserIcon size={20} color="#6b7280" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate({ type: 'projects' })}
            style={{ fontSize: '16px', color: '#1C1C1C' }}
          >
            ← Projects
          </button>
          <button
            onClick={handleDelete}
            style={{ fontSize: '14px', color: '#E8533A' }}
          >
            Delete
          </button>
        </div>

        {isEditing ? (
          <div className="mb-4">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b-2 border-[#E8533A] outline-none"
              style={{ fontSize: '24px', fontWeight: 500, color: '#1C1C1C' }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
              onBlur={handleSaveRename}
            />
          </div>
        ) : (
          <h1
            className="mb-4 cursor-pointer"
            onClick={() => setIsEditing(true)}
            style={{ fontSize: '24px', fontWeight: 500, color: '#1C1C1C' }}
          >
            {project.name}
          </h1>
        )}

        {/* Stats */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
          <div className="flex items-end justify-between mb-4">
            <div style={{ fontSize: '72px', fontWeight: 700, color: '#E8533A', lineHeight: '1' }}>
              {percentage}%
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total</div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: '#1C1C1C', marginTop: '4px' }}>
                {total}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Done</div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: '#1C1C1C', marginTop: '4px' }}>
                {completed}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-6 space-y-3 pb-32">
        {projectTasks.length > 0 ? (
          projectTasks.map((task) => (
            <TaskTile
              key={task.id}
              task={task}
              project={undefined}
              onToggleComplete={onToggleComplete}
              onClick={() => onNavigate({ type: 'editTask', taskId: task.id })}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div style={{ fontSize: '16px', color: '#6b7280' }}>
              No tasks in this project yet
            </div>
          </div>
        )}
      </div>

      {/* Add task button */}
      <div className="fixed bottom-20 right-6">
        <button
          onClick={() => onNavigate({ type: 'addTask', projectId: project.id })}
          className="w-14 h-14 rounded-full bg-[#E8533A] flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          style={{ fontSize: '24px', color: '#F5F0E8' }}
        >
          +
        </button>
      </div>
    </div>
  );
}

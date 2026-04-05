import { useState } from 'react';
import { User, Task, Project, Screen } from '../../types';
import { Home, CheckSquare, Folder, User as UserIcon } from 'lucide-react';

interface ProjectsScreenProps {
  user: User;
  tasks: Task[];
  projects: Project[];
  onNavigate: (screen: Screen) => void;
  onAddProject: (name: string) => void;
}

export function ProjectsScreen({
  user,
  tasks,
  projects,
  onNavigate,
  onAddProject,
}: ProjectsScreenProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const userProjects = projects.filter((p) => p.userId === user.id);

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(
      (t) => t.projectId === projectId && t.userId === user.id
    );
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setIsAdding(false);
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
          </div>
          <button
            onClick={() => onNavigate({ type: 'settings' })}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
          >
            <UserIcon size={20} color="#6b7280" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate({ type: 'taskList' })}
            style={{ fontSize: '16px', color: '#1C1C1C' }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1C1C1C' }}>
            Projects
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 pb-24">
        {userProjects.map((project) => {
          const stats = getProjectStats(project.id);
          return (
            <button
              key={project.id}
              onClick={() => onNavigate({ type: 'projectDetail', projectId: project.id })}
              className="w-full p-7 bg-[#1C1C1C] rounded-3xl text-left hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              <div style={{ fontSize: '20px', fontWeight: 400, color: '#F5F0E8', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                {project.name}
              </div>
              <div className="flex items-end justify-between">
                <div style={{ fontSize: '13px', color: '#9ca3af', letterSpacing: '0.01em' }}>
                  {stats.completed} of {stats.total} tasks
                </div>
                <div style={{ fontSize: '56px', fontWeight: 700, color: '#E8533A', lineHeight: '1' }}>
                  {stats.percentage}%
                </div>
              </div>
            </button>
          );
        })}

        {/* Add project card */}
        {isAdding ? (
          <div className="p-6 bg-white rounded-2xl border-2 border-[#E8533A]">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full mb-4 px-0 py-2 bg-transparent border-b-2 border-[#1C1C1C]/20 focus:border-[#E8533A] outline-none"
              style={{ fontSize: '18px', color: '#1C1C1C' }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddProject}
                className="flex-1 py-2 rounded-xl bg-[#E8533A] hover:opacity-90 transition-opacity"
                style={{ fontSize: '14px', fontWeight: 500, color: '#F5F0E8' }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewProjectName('');
                }}
                className="flex-1 py-2 rounded-xl bg-[#1C1C1C] hover:opacity-90 transition-opacity"
                style={{ fontSize: '14px', fontWeight: 500, color: '#F5F0E8' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full p-6 bg-transparent rounded-2xl border-2 border-dashed border-[#E8533A] hover:bg-[#E8533A]/5 transition-colors"
          >
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#E8533A' }}>
              + Add Project
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

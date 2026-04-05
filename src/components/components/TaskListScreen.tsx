import { useState } from 'react';
import { User, Task, Project, Screen, FilterType } from '../../types';
import { isTaskDueToday } from '../../utils';
import { TaskTile } from './TaskTile';
import { Home, CheckSquare, Folder, User as UserIcon } from 'lucide-react';

interface TaskListScreenProps {
  user: User;
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (taskId: string) => void;
  onNavigate: (screen: Screen) => void;
  initialFilter?: FilterType;
}

export function TaskListScreen({
  user,
  tasks,
  projects,
  onToggleComplete,
  onNavigate,
  initialFilter = 'all',
}: TaskListScreenProps) {
  const [filter, setFilter] = useState<FilterType>(initialFilter);

  const userTasks = tasks.filter((t) => t.userId === user.id);

  const filteredTasks = userTasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'today') return isTaskDueToday(task) && !task.completed;
    if (filter === 'upcoming') return task.dueDate && !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const myTasks = filteredTasks.filter((t) => !t.projectId);
  const projectTasks = filteredTasks.filter((t) => t.projectId);

  const groupedByProject = projectTasks.reduce(
    (acc, task) => {
      const projectId = task.projectId!;
      if (!acc[projectId]) {
        acc[projectId] = [];
      }
      acc[projectId].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="sticky top-0 bg-[#F5F0E8] border-b border-[#1C1C1C]/10 z-20">
        <div className="p-6 pb-4">
          {/* Top navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
            >
              <Home size={20} color="#6b7280" />
            </button>
            <div className="flex gap-8">
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#E8533A]/10">
                <CheckSquare size={20} color="#E8533A" />
                <span style={{ fontSize: '10px', color: '#E8533A', fontWeight: 500 }}>Tasks</span>
              </button>
              <button
                onClick={() => onNavigate({ type: 'projects' })}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
              >
                <Folder size={20} color="#6b7280" />
                <span style={{ fontSize: '10px', color: '#6b7280' }}>Projects</span>
              </button>
            </div>
            <button
              onClick={() => onNavigate({ type: 'settings' })}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
            >
              <UserIcon size={20} color="#6b7280" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#1C1C1C' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{dateString}</div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'today', 'upcoming', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-full whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: filter === f ? '#E8533A' : '#1C1C1C',
                  color: '#F5F0E8',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8 pb-24">
        {/* My Tasks */}
        {myTasks.length > 0 && (
          <div>
            <h2
              className="mb-4"
              style={{ fontSize: '18px', fontWeight: 500, color: '#1C1C1C' }}
            >
              My Tasks
            </h2>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <TaskTile
                  key={task.id}
                  task={task}
                  project={undefined}
                  onToggleComplete={onToggleComplete}
                  onClick={() => onNavigate({ type: 'editTask', taskId: task.id })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {Object.keys(groupedByProject).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#1C1C1C' }}>
                Projects
              </h2>
              <button
                onClick={() => onNavigate({ type: 'projects' })}
                style={{ fontSize: '14px', color: '#E8533A' }}
              >
                View all →
              </button>
            </div>
            <div className="space-y-6">
              {Object.entries(groupedByProject).map(([projectId, tasks]) => {
                const project = projects.find((p) => p.id === projectId);
                if (!project) return null;

                return (
                  <div key={projectId}>
                    <div
                      className="mb-2 cursor-pointer"
                      onClick={() =>
                        onNavigate({ type: 'projectDetail', projectId })
                      }
                    >
                      <span style={{ fontSize: '16px', fontWeight: 500, color: '#1C1C1C' }}>
                        {project.name}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <TaskTile
                          key={task.id}
                          task={task}
                          project={project}
                          onToggleComplete={onToggleComplete}
                          onClick={() =>
                            onNavigate({ type: 'editTask', taskId: task.id })
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div style={{ fontSize: '16px', color: '#6b7280' }}>
              No tasks found
            </div>
          </div>
        )}
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => onNavigate({ type: 'projects' })}
          className="w-14 h-14 rounded-full bg-[#1C1C1C] flex items-center justify-center shadow-lg transition-all duration-200 hover:w-32 hover:px-4 group overflow-hidden"
          style={{ fontSize: '24px', color: '#F5F0E8' }}
        >
          <span className="hidden group-hover:flex mr-2 transition-all duration-200" style={{ fontSize: '14px' }}>Add Project</span>
          <span className="group-hover:hidden transition-all duration-200">#</span>
        </button>
        <button
          onClick={() => onNavigate({ type: 'addTask' })}
          className="w-14 h-14 rounded-full bg-[#E8533A] flex items-center justify-center shadow-lg transition-all duration-200 hover:w-32 hover:px-4 group overflow-hidden"
          style={{ fontSize: '24px', color: '#F5F0E8' }}
        >
          <span className="hidden group-hover:flex mr-2 transition-all duration-200" style={{ fontSize: '14px' }}>Add Task</span>
          <span className="group-hover:hidden transition-all duration-200">+</span>
        </button>
      </div>
    </div>
  );
}

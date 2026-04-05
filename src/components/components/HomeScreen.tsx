import { User, Task, Screen } from '../../types';
import { isTaskDueToday, isTaskDueTomorrow } from '../../utils';
import { DecorativeCircles } from './DecorativeCircles';
import { Home, CheckSquare, Folder, User as UserIcon } from 'lucide-react';

interface HomeScreenProps {
  user: User;
  tasks: Task[];
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ user, tasks, onNavigate }: HomeScreenProps) {
  const userTasks = tasks.filter((t) => t.userId === user.id);
  const tasksToday = userTasks.filter((t) => !t.completed && isTaskDueToday(t)).length;
  const tasksTomorrow = userTasks.filter((t) => !t.completed && isTaskDueTomorrow(t)).length;
  const tasksCompleted = userTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-[#F5F0E8] relative overflow-hidden">
      <DecorativeCircles />

      <div className="relative z-10 p-6 max-w-md mx-auto pt-16">
        {/* Top navigation */}
        <div className="flex justify-between items-center mb-8">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#E8533A]/10">
            <Home size={20} color="#E8533A" />
          </button>
          <div className="flex gap-8">
            <button
              onClick={() => onNavigate({ type: 'taskList' })}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1C1C1C]/5 transition-colors"
            >
              <CheckSquare size={20} color="#6b7280" />
              <span style={{ fontSize: '10px', color: '#6b7280' }}>Tasks</span>
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

        <h1 className="mb-16" style={{ fontSize: '36px', fontWeight: 300, color: '#1C1C1C', letterSpacing: '-0.02em' }}>
          Hello, {user.name}
        </h1>

        <div className="space-y-10 mb-16">
          <div
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onNavigate({ type: 'taskList', filter: 'today' })}
          >
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Tasks today
            </div>
            <div style={{ fontSize: '64px', fontWeight: 700, color: '#E8533A', lineHeight: '1' }}>
              {tasksToday}
            </div>
          </div>

          <div
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onNavigate({ type: 'taskList', filter: 'upcoming' })}
          >
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Due tomorrow
            </div>
            <div style={{ fontSize: '64px', fontWeight: 700, color: '#E8533A', lineHeight: '1' }}>
              {tasksTomorrow}
            </div>
          </div>

          <div
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onNavigate({ type: 'taskList', filter: 'completed' })}
          >
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Completed
            </div>
            <div style={{ fontSize: '64px', fontWeight: 700, color: '#E8533A', lineHeight: '1' }}>
              {tasksCompleted}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate({ type: 'taskList' })}
          className="w-full flex items-center justify-between px-8 py-5 bg-[#1C1C1C] rounded-3xl hover:opacity-90 transition-opacity shadow-lg"
        >
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#F5F0E8', letterSpacing: '-0.01em' }}>
            View all tasks
          </span>
          <span style={{ fontSize: '24px', color: '#E8533A' }}>→</span>
        </button>
      </div>
    </div>
  );
}

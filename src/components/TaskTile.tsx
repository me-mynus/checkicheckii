import { useState, useRef, useEffect } from 'react';
import { Task, Project } from '../types';
import { formatDate, isTaskOverdue } from '../utils';

interface TaskTileProps {
  task: Task;
  project: Project | undefined;
  onToggleComplete: (taskId: string) => void;
  onClick: () => void;
}

export function TaskTile({ task, project, onToggleComplete, onClick }: TaskTileProps) {
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const isOverdue = isTaskOverdue(task);

  useEffect(() => {
    if (task.completed) {
      setDragProgress(100);
    } else {
      setDragProgress(0);
    }
  }, [task.completed]);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    currentXRef.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !tileRef.current) return;

    currentXRef.current = clientX;
    const deltaX = clientX - startXRef.current;
    const tileWidth = tileRef.current.offsetWidth;
    const progress = Math.max(0, Math.min(100, (deltaX / tileWidth) * 100));

    setDragProgress(progress);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragProgress > 60) {
      setDragProgress(100);
      onToggleComplete(task.id);
    } else if (dragProgress < -20 && task.completed) {
      setDragProgress(0);
      onToggleComplete(task.id);
    } else {
      setDragProgress(task.completed ? 100 : 0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragProgress]);

  const handleClick = (e: React.MouseEvent) => {
    if (Math.abs(currentXRef.current - startXRef.current) < 5) {
      onClick();
    }
  };

  return (
    <div
      ref={tileRef}
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none shadow-md hover:shadow-lg transition-shadow"
      style={{
        minHeight: '72px',
        backgroundColor: task.completed ? '#1C1C1C' : '#1C1C1C',
        transition: isDragging ? 'none' : 'background-color 0.3s, box-shadow 0.3s',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* Strikethrough line */}
      <div
        className="absolute top-1/2 left-0 h-0.5 bg-[#E8533A] -translate-y-1/2 transition-all shadow-sm"
        style={{
          width: `${dragProgress}%`,
          transition: isDragging ? 'none' : 'width 0.3s',
        }}
      />

      <div className="relative z-10 p-5 flex items-center justify-between">
        <div className="flex-1">
          <div
            style={{
              fontSize: '16px',
              fontWeight: 400,
              color: task.completed ? '#9ca3af' : '#F5F0E8',
              transition: 'color 0.3s',
              letterSpacing: '-0.01em',
            }}
          >
            {task.name}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {task.dueDate && (
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: isOverdue ? '#E8533A' : '#f59e0b',
                  color: '#F5F0E8',
                  letterSpacing: '0.02em',
                }}
              >
                {formatDate(task.dueDate)}
              </span>
            )}
            {project && (
              <span
                style={{
                  fontSize: '12px',
                  color: task.completed ? '#6b7280' : '#9ca3af',
                  letterSpacing: '0.01em',
                }}
              >
                {project.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

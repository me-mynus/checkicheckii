import { useState, useEffect } from 'react';
import { User, Task, Project, Screen } from './types';
import {
  getUsers,
  saveUsers,
  getTasks,
  saveTasks,
  getProjects,
  saveProjects,
  getActiveUserId,
  setActiveUserId,
  initializeStorage,
} from './storage';
import { sendNtfyNotification, isTaskDueTomorrow } from './utils';
import { syncToSupabase, loadFromSupabase } from './supabaseSync';
import { HomeScreen } from './components/HomeScreen';
import { TaskListScreen } from './components/TaskListScreen';
import { AddTaskScreen } from './components/AddTaskScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { ProjectDetailScreen } from './components/ProjectDetailScreen';
import { SettingsScreen } from './components/SettingsScreen';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeUserId, setActiveUserIdState] = useState<string>('');
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'home' });

  // Initialize
  useEffect(() => {
    initializeStorage();
    const loadedUsers = getUsers();
    setUsers(loadedUsers);
    setTasks(getTasks());
    setProjects(getProjects());
    
    // Check URL parameters for user switching
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) {
      let user = loadedUsers.find(u => u.name.toLowerCase() === userParam.toLowerCase());
      if (!user) {
        // New user, prompt for name
        const displayName = prompt(`Welcome! What would you like to be called? (URL suggests: ${userParam})`, userParam) || userParam;
        user = {
          id: crypto.randomUUID(),
          name: displayName,
          ntfyTopic: `${displayName.toLowerCase().replace(/\s+/g, '')}`,
        };
        loadedUsers.push(user);
        saveUsers(loadedUsers);
        setUsers(loadedUsers);
      }
      setActiveUserIdState(user.id);
      setActiveUserId(user.id);
      return;
    }
    
    const userId = getActiveUserId();
    if (userId) {
      setActiveUserIdState(userId);
    }
  }, []);

  // Load user data from Supabase
  useEffect(() => {
    if (activeUserId) {
      loadFromSupabase(activeUserId).then(({ tasks: remoteTasks, projects: remoteProjects, user: remoteUser }) => {
        setTasks(remoteTasks);
        setProjects(remoteProjects);
        if (remoteUser) {
          // Update local user data if it exists remotely
          const updatedUsers = users.map(u => u.id === activeUserId ? remoteUser : u);
          if (!users.find(u => u.id === activeUserId)) {
            updatedUsers.push(remoteUser);
          }
          setUsers(updatedUsers);
          saveUsers(updatedUsers);
        }
      });
    }
  }, [activeUserId]);

  // Check for notifications on mount and when tasks change
  useEffect(() => {
    checkAndSendNotifications();
  }, [tasks, users]);

  const activeUser = users.find((u) => u.id === activeUserId);

  const checkAndSendNotifications = async () => {
    const now = new Date();
    const updatedTasks: Task[] = [];
    let hasChanges = false;

    for (const task of tasks) {
      if (
        task.notificationEnabled &&
        !task.notificationSent &&
        !task.completed &&
        task.dueDate &&
        isTaskDueTomorrow(task)
      ) {
        const user = users.find((u) => u.id === task.userId);
        if (user) {
          await sendNtfyNotification(
            user.ntfyTopic,
            'Task Reminder',
            `Reminder: "${task.name}" is due tomorrow.`
          );
          updatedTasks.push({ ...task, notificationSent: true });
          hasChanges = true;
        }
      } else {
        updatedTasks.push(task);
      }
    }

    if (hasChanges) {
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
  };

  // User actions
  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
    setActiveUserIdState(userId);
  };

  const handleAddUser = (name: string, ntfyTopic: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      ntfyTopic,
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleUpdateUser = (userId: string, updates: { name?: string; ntfyTopic?: string }) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  // Task actions
  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncToSupabase(activeUserId, updatedTasks, projects, activeUser);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (currentScreen.type === 'editTask') {
      const updatedTasks = tasks.map((t) =>
        t.id === currentScreen.taskId ? { ...t, ...taskData } : t
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      syncToSupabase(activeUserId, updatedTasks, projects, activeUser);
    } else {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      syncToSupabase(activeUserId, updatedTasks, projects, activeUser);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    syncToSupabase(activeUserId, updatedTasks, projects, activeUser);
  };

  // Project actions
  const handleAddProject = (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      userId: activeUserId,
      name,
      createdAt: new Date().toISOString(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    syncToSupabase(activeUserId, tasks, updatedProjects, activeUser);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    const updatedTasks = tasks.filter((t) => t.projectId !== projectId);
    setProjects(updatedProjects);
    setTasks(updatedTasks);
    saveProjects(updatedProjects);
    saveTasks(updatedTasks);
    syncToSupabase(activeUserId, updatedTasks, updatedProjects, activeUser);
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, name: newName } : p
    );
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    syncToSupabase(activeUserId, tasks, updatedProjects, activeUser);
  };

  if (!activeUser) {
    return (
      <div className="size-full flex items-center justify-center bg-[#F5F0E8]">
        <div style={{ fontSize: '16px', color: '#1C1C1C' }}>Loading...</div>
      </div>
    );
  }

  // Render current screen
  if (currentScreen.type === 'home') {
    return (
      <HomeScreen
        user={activeUser}
        tasks={tasks}
        onNavigate={setCurrentScreen}
      />
    );
  }

  if (currentScreen.type === 'taskList') {
    return (
      <TaskListScreen
        user={activeUser}
        tasks={tasks}
        projects={projects}
        onToggleComplete={handleToggleComplete}
        onNavigate={setCurrentScreen}
        initialFilter={currentScreen.filter}
      />
    );
  }

  if (currentScreen.type === 'addTask') {
    return (
      <AddTaskScreen
        user={activeUser}
        projects={projects}
        defaultProjectId={currentScreen.projectId}
        onSave={handleSaveTask}
        onNavigate={setCurrentScreen}
      />
    );
  }

  if (currentScreen.type === 'editTask') {
    const task = tasks.find((t) => t.id === currentScreen.taskId);
    if (!task) {
      setCurrentScreen({ type: 'taskList' });
      return null;
    }
    return (
      <AddTaskScreen
        user={activeUser}
        task={task}
        projects={projects}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onNavigate={setCurrentScreen}
      />
    );
  }

  if (currentScreen.type === 'projects') {
    return (
      <ProjectsScreen
        user={activeUser}
        tasks={tasks}
        projects={projects}
        onNavigate={setCurrentScreen}
        onAddProject={handleAddProject}
      />
    );
  }

  if (currentScreen.type === 'projectDetail') {
    const project = projects.find((p) => p.id === currentScreen.projectId);
    if (!project) {
      setCurrentScreen({ type: 'projects' });
      return null;
    }
    return (
      <ProjectDetailScreen
        user={activeUser}
        project={project}
        tasks={tasks}
        projects={projects}
        onToggleComplete={handleToggleComplete}
        onNavigate={setCurrentScreen}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />
    );
  }

  if (currentScreen.type === 'settings') {
    return (
      <SettingsScreen
        users={users}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onUpdateUser={handleUpdateUser}
        onNavigate={setCurrentScreen}
      />
    );
  }

  return null;
}
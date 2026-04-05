import { useState } from 'react';
import { User, Screen } from '../types';
import { getInitials } from '../utils';

interface SettingsScreenProps {
  users: User[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  onUpdateUser: (userId: string, updates: { name?: string; ntfyTopic?: string }) => void;
  onNavigate: (screen: Screen) => void;
}

export function SettingsScreen({
  users,
  activeUserId,
  onSwitchUser,
  onUpdateUser,
  onNavigate,
}: SettingsScreenProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingTopic, setEditingTopic] = useState('');

  const activeUser = users.find((u) => u.id === activeUserId);

  const handleAddUser = () => {
    if (newUserName.trim() && newUserTopic.trim()) {
      onAddUser(newUserName.trim(), newUserTopic.trim());
      setNewUserName('');
      setNewUserTopic('');
      setIsAddingUser(false);
    }
  };

  const handleUpdateUser = (userId: string) => {
    const updates: { name?: string; ntfyTopic?: string } = {};
    if (editingName.trim() && editingName !== users.find(u => u.id === userId)?.name) {
      updates.name = editingName.trim();
    }
    if (editingTopic.trim() && editingTopic !== users.find(u => u.id === userId)?.ntfyTopic) {
      updates.ntfyTopic = editingTopic.trim();
    }
    if (Object.keys(updates).length > 0) {
      onUpdateUser(userId, updates);
    }
    setEditingUserId(null);
    setEditingName('');
    setEditingTopic('');
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
            Settings
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* User management */}
        <div>
          <div className="space-y-4">
            {activeUser && (
              <div key={activeUser.id} className="bg-white rounded-3xl p-5 shadow-sm">
                <div
                  className="w-full flex items-center gap-4 mb-4"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: '#E8533A',
                      border: '3px solid #E8533A',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#F5F0E8',
                    }}
                  >
                    {getInitials(activeUser.name)}
                  </div>
                  <div className="flex-1 text-left">
                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#1C1C1C', letterSpacing: '-0.01em' }}>
                      {activeUser.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#E8533A', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                      Active
                    </div>
                  </div>
                </div>

                {/* Edit user */}
                {editingUserId === activeUser.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="User name"
                      className="w-full px-3 py-2 bg-[#F5F0E8] rounded-lg outline-none"
                      style={{ fontSize: '14px', color: '#1C1C1C' }}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editingTopic}
                      onChange={(e) => setEditingTopic(e.target.value)}
                      placeholder="ntfy.sh topic"
                      className="w-full px-3 py-2 bg-[#F5F0E8] rounded-lg outline-none"
                      style={{ fontSize: '14px', color: '#1C1C1C' }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateUser(activeUser.id)}
                        className="flex-1 py-2 rounded-lg bg-[#E8533A]"
                        style={{ fontSize: '12px', fontWeight: 500, color: '#F5F0E8' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingUserId(null);
                          setEditingName('');
                          setEditingTopic('');
                        }}
                        className="flex-1 py-2 rounded-lg bg-[#1C1C1C]"
                        style={{ fontSize: '12px', fontWeight: 500, color: '#F5F0E8' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Name
                      </div>
                      <div style={{ fontSize: '14px', color: '#1C1C1C' }}>
                        {activeUser.name}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        ntfy.sh topic
                      </div>
                      <div style={{ fontSize: '14px', color: '#E8533A' }}>
                        {activeUser.ntfyTopic}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingUserId(activeUser.id);
                        setEditingName(activeUser.name);
                        setEditingTopic(activeUser.ntfyTopic);
                      }}
                      className="w-full py-2 rounded-lg bg-[#1C1C1C] text-center"
                      style={{ fontSize: '12px', fontWeight: 500, color: '#F5F0E8' }}
                    >
                      Edit User
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ntfy.sh info */}
        <div className="p-6 bg-white rounded-3xl shadow-sm">
          <h3
            className="mb-3"
            style={{ fontSize: '18px', fontWeight: 500, color: '#1C1C1C', letterSpacing: '-0.01em' }}
          >
            About Notifications
          </h3>
          <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
            This app uses ntfy.sh for push notifications. To receive reminders:
            <ol className="mt-3 ml-4 space-y-2" style={{ listStyleType: 'decimal' }}>
              <li>Install the ntfy app on your device</li>
              <li>Subscribe to your personal topic</li>
              <li>Notifications will be sent 24 hours before tasks are due</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

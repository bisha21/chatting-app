import React, { useState } from 'react';
import { AuthProvider, useAuth, type User } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './animations.css'; 
import { LoginForm } from './component/Login';
import UserList from './component/userList';
import ChatArea from './component/ChatArea';

// Main Chat Component
const ChatApp: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user, isLoading } = useAuth();

  const handleSelectUser = (user: User): void => {
    setSelectedUser(user);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex overflow-hidden">
      <UserList selectedUser={selectedUser} onSelectUser={handleSelectUser} />
      <ChatArea selectedUser={selectedUser} />
    </div>
  );
};

// Main App with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatApp />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;

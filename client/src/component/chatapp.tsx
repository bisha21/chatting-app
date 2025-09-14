// src/components/ChatApp.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from './Login';

const ChatApp: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Welcome {user.fullName}</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-700 text-xl">💬 Chat UI will go here...</p>
      </div>
    </div>
  );
};

export default ChatApp;

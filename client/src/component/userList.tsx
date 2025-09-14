import React, { useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import axios from 'axios';
import { useAuth, type User as UserType } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface UserListProps {
  selectedUser: UserType | null;
  onSelectUser: (user: UserType) => void;
}

interface UsersApiResponse {
  success: string;
  data: {
    users: UserType[];
    unSeenMessage: Record<string, number>;
  };
}

const UserList: React.FC<UserListProps> = ({ selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<UsersApiResponse>(
          'http://localhost:3000/api/message/users',
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );
        setUsers(response.data.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleUserClick = (chatUser: UserType) => (): void => {
    onSelectUser(chatUser);
  };

  const handleLogout = (): void => {
    logout();
  };

  const isUserOnline = (userId: number): boolean =>
    onlineUsers.includes(userId.toString());

  const isSelectedUser = (userId: number): boolean =>
    selectedUser?.id === userId;

  if (isLoading) {
    return (
      <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.fullName}</h2>
              <p className="text-sm opacity-80">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-110"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Online Indicator */}
      <div className="p-4 bg-green-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-green-700">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {onlineUsers.length} users online
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {users.map((chatUser, index) => (
          <div
            key={chatUser.id}
            onClick={handleUserClick(chatUser)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 animate-fade-in-up ${
              isSelectedUser(chatUser.id)
                ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-l-purple-500'
                : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectUser(chatUser);
              }
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {chatUser.fullName.charAt(0).toUpperCase()}
                </div>
                {isUserOnline(chatUser.id) && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-lg">
                  {chatUser.fullName}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {chatUser.bio || 'Available for chat'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;

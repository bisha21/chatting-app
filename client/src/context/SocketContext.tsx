import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:3000';

// Types
interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

interface SocketProviderProps {
  children: ReactNode;
}

interface ServerToClientEvents {
  getOnlineUsers: (users: string[]) => void;
}

interface ClientToServerEvents {
  // Add any client-to-server events here if needed
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        API_BASE_URL,
        {
          query: { userId: user.id.toString() },
        }
      );

      newSocket.on('getOnlineUsers', (users: string[]) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setOnlineUsers([]);
      };
    }
  }, [user]);

  const value: SocketContextType = {
    socket,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

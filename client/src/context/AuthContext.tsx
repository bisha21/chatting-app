import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

const API_BASE_URL = 'http://localhost:3000';

// Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  bio?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

// API utility
export const apiCall = async <T = any,>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message);
  }

  return response.json();
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ Fetch user from backend using token
  const refreshUser = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me: User = await apiCall('/api/auth/me');
      setUser(me);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout(); // token expired/invalid
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response: AuthResponse = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    const response: AuthResponse = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    refreshUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

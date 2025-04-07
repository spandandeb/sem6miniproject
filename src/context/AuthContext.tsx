import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const token = localStorage.getItem('authToken');
    console.log('AUTH INIT - Token exists:', !!token);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    // In a real app, you would validate credentials and get a token
    console.log('AUTH - Login called');
    localStorage.setItem('authToken', 'dummy-token-12345');
    setIsAuthenticated(true);
    console.log('AUTH - User is now authenticated');
  };

  const logout = () => {
    console.log('AUTH - Logout called');
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    console.log('AUTH - User is now logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
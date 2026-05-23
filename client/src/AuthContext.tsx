import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from './api';
import type { User } from './api';

// Demo data for guest mode
const GUEST_USER: User = {
  id: 'guest',
  email: 'gość@demo.pl',
  notificationsEnabled: false,
  createdAt: new Date().toISOString(),
};

interface AuthCtx {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem('guestMode') === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guest mode - no API call needed
    if (isGuest) {
      setUser(GUEST_USER);
      setLoading(false);
      return;
    }

    if (token) {
      authApi.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, isGuest]);

  const login = async (email: string, password: string) => {
    // Clear guest mode if logging in properly
    localStorage.removeItem('guestMode');
    setIsGuest(false);

    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const loginAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    localStorage.removeItem('token');
    setToken(null);
    setIsGuest(true);
    setUser(GUEST_USER);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
    setToken(null);
    setIsGuest(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isGuest, login, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

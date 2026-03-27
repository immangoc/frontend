import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'planner' | 'operator' | 'customer';
  company?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  accessToken: string | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<AuthUser>;
  signup:  (data: SignupData) => Promise<void>;
  logout:  () => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

// ─── API helper ───────────────────────────────────────────────────────────────
const API = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;

async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // anon key để Supabase cho phép gọi edge function
    'Authorization': `Bearer ${token || publicAnonKey}`,
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ht_token';
const USER_KEY  = 'ht_user';

export function WarehouseAuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục session từ localStorage khi app load
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        setToken(savedToken);
        setUser(parsedUser);
      } catch {
        // Nếu localStorage bị hỏng thì xóa để user đăng nhập lại bình thường.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // ── Đăng nhập — gọi backend, so sánh với database ────────────────────────
  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const { token: newToken, user: userData } = data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    return userData;
  };

  // ── Đăng ký ───────────────────────────────────────────────────────────────
  const signup = async (signupData: SignupData): Promise<void> => {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  };

  // ── Đăng xuất ────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, accessToken: token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useWarehouseAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useWarehouseAuth must be used inside WarehouseAuthProvider');
  return ctx;
}

// Helper: lấy headers có token để gọi API
export function useAuthHeaders() {
  const { token } = useWarehouseAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
  };
}
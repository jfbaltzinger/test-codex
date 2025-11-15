import { create } from 'zustand';

type UserRole = 'member' | 'admin';

const getInitialToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
};

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  credits: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setCredentials: (payload: { user: AuthUser; token: string }) => void;
  hydrateToken: (token: string) => void;
  clearCredentials: () => void;
  updateCredits: (credits: number) => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken()),
  setCredentials: ({ user, token }) =>
    set(() => ({
      user,
      token,
      isAuthenticated: true,
    })),
  hydrateToken: (token) =>
    set(() => ({
      token,
      isAuthenticated: true,
    })),
  clearCredentials: () =>
    set(() => ({
      user: null,
      token: null,
      isAuthenticated: false,
    })),
  updateCredits: (credits) =>
    set((state) => ({
      user: state.user ? { ...state.user, credits } : state.user,
    })),
  updateUser: (user) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...user } : state.user,
    })),
}));

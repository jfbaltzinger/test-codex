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
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string;
  phone?: string | null;
  emergencyContact?: string | null;
  role: UserRole;
  credits: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setCredentials: (payload: { user: AuthUser; token: string }) => void;
  hydrateToken: (token: string) => void;
  setSessionFromRefresh: (payload: { user: AuthUser; accessToken: string }) => void;
  markHydrated: () => void;
  setUser: (user: AuthUser | null) => void;
  clearCredentials: () => void;
  updateCredits: (credits: number) => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken()),
  hydrated: false,
  setCredentials: ({ user, token }) =>
    set(() => ({
      user,
      token,
      isAuthenticated: true,
      hydrated: true,
    })),
  hydrateToken: (token) =>
    set(() => ({
      token,
      isAuthenticated: true,
      hydrated: true,
    })),
  setSessionFromRefresh: ({ user, accessToken }) =>
    set(() => ({
      user,
      token: accessToken,
      isAuthenticated: true,
      hydrated: true,
    })),
  markHydrated: () =>
    set((state) => ({
      hydrated: true,
      isAuthenticated: state.isAuthenticated && Boolean(state.token),
    })),
  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: Boolean(user) || state.isAuthenticated,
    })),
  clearCredentials: () =>
    set(() => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: true,
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

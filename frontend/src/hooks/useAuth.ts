import { useMutation, useQuery } from '@tanstack/react-query';
import {
  login,
  logout as apiLogout,
  refreshProfile,
  requestPasswordReset,
  resetPassword,
  type LoginResponse,
  type PasswordResetPayload,
  type PasswordResetRequestPayload,
} from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export const useLogin = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, user }) => {
      setCredentials({ user, token: accessToken });
      localStorage.setItem('token', accessToken);
    },
  });
};

export const useProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const markHydrated = useAuthStore((state) => state.markHydrated);
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['profile'],
    queryFn: refreshProfile,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    onSuccess: (user) => {
      setUser(user);
      markHydrated();
    },
    onError: () => {
      markHydrated();
    },
  });
};

export const useLogout = () => {
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      clearCredentials();
      localStorage.removeItem('token');
    },
    onError: () => {
      clearCredentials();
      localStorage.removeItem('token');
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (payload: PasswordResetRequestPayload) => requestPasswordReset(payload),
  });
};

export const useResetPassword = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: (payload: PasswordResetPayload): Promise<LoginResponse> => resetPassword(payload),
    onSuccess: ({ accessToken, user }) => {
      setCredentials({ user, token: accessToken });
      localStorage.setItem('token', accessToken);
    },
  });
};

import { useMutation, useQuery } from '@tanstack/react-query';
import { login, refreshProfile } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export const useLogin = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setCredentials({ token, user });
      localStorage.setItem('token', token);
    },
  });
};

export const useProfile = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const hydrateToken = useAuthStore((state) => state.hydrateToken);
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['profile'],
    queryFn: refreshProfile,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    onSuccess: (user) => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        hydrateToken(storedToken);
        setCredentials({ user, token: storedToken });
      }
    },
  });
};

export const useLogout = () => {
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  return () => {
    clearCredentials();
    localStorage.removeItem('token');
  };
};

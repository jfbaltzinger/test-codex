import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/store/authStore';

const configuredBaseURL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;

const fallbackBaseURL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : 'http://localhost:3000/api';

const baseURL = configuredBaseURL ?? fallbackBaseURL;

type RefreshingRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

type AuthSessionResponse = {
  accessToken: string;
  user: AuthUser;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthSessionResponse>('/auth/refresh', undefined, { headers: { 'Content-Type': 'application/json' } })
      .then(({ data }) => {
        const { setSessionFromRefresh } = useAuthStore.getState();
        setSessionFromRefresh({ user: data.user, accessToken: data.accessToken });
        localStorage.setItem('token', data.accessToken);
        return data.accessToken;
      })
      .catch((_error: AxiosError) => {
        const { clearCredentials } = useAuthStore.getState();
        clearCredentials();
        localStorage.removeItem('token');
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RefreshingRequestConfig | undefined;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retry = true;
      const newToken = await performRefresh();
      if (newToken) {
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        } as AxiosRequestConfig['headers'];
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

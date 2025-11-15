import api from './client';
import type { AuthUser } from '@/store/authStore';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface PasswordResetRequestPayload {
  email: string;
  redirectUrl: string;
}

export interface PasswordResetPayload {
  token: string;
  password: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const refreshProfile = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>('/auth/profile');
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const requestPasswordReset = async (payload: PasswordResetRequestPayload): Promise<void> => {
  await api.post('/auth/forgot-password', payload, { skipAuthRefresh: true });
};

export const resetPassword = async (payload: PasswordResetPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/reset-password', payload, { skipAuthRefresh: true });
  return data;
};

export const refreshSession = async (): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/refresh', undefined, { skipAuthRefresh: true });
  return data;
};

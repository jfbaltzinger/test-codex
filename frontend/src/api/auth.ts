import api from './client';
import type { AuthUser } from '@/store/authStore';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const refreshProfile = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>('/auth/profile');
  return data;
};

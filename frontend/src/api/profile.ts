import api from './client';
import type { AuthUser } from '@/store/authStore';

export type UpdateProfilePayload = Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'avatarUrl'>> & {
  phone?: string;
  emergencyContact?: string;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<AuthUser> => {
  const { data } = await api.put<AuthUser>('/auth/profile', payload);
  return data;
};

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<void> => {
  await api.post('/auth/profile/password', payload);
};

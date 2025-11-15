import api from './client';

export interface Course {
  id: string;
  name: string;
  description: string;
  intensity: 'soft' | 'medium' | 'high';
  durationMinutes: number;
}

export const getCourses = async (): Promise<Course[]> => {
  const { data } = await api.get<Course[]>('/courses');
  return data;
};

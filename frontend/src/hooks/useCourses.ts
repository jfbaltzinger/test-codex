import { useQuery } from '@tanstack/react-query';
import { Course, getCourses } from '@/api/courses';

export const useCourses = () =>
  useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

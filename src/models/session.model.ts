import { z } from 'zod';

export const sessionSchemas = {
  getById: z.object({
    id: z.string()
  })
};

export type Session = {
  id: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  instructor: string;
};

import { z } from 'zod';

export const adminSessionSchemas = {
  create: z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    startsAt: z.string(),
    durationMinutes: z.number().int().positive(),
    instructor: z.string().min(1),
    capacity: z.number().int().positive().default(10)
  }),
  update: z.object({
    id: z.string().uuid(),
    title: z.string().min(1).optional(),
    startsAt: z.string().optional(),
    durationMinutes: z.number().int().positive().optional(),
    instructor: z.string().min(1).optional(),
    capacity: z.number().int().positive().optional()
  }),
  remove: z.object({
    id: z.string().uuid()
  })
};

export type AdminSessionInput = z.infer<typeof adminSessionSchemas.create>;

import { z } from 'zod';

export const adminUserSchemas = {
  create: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['user', 'admin']),
    credits: z.number().int().nonnegative().optional()
  }),
  update: z.object({
    id: z.string().uuid(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['user', 'admin']).optional(),
    credits: z.number().int().nonnegative().optional()
  }),
  remove: z.object({
    id: z.string().uuid()
  })
};

export type AdminUserCreateInput = z.infer<typeof adminUserSchemas.create>;
export type AdminUserUpdateInput = z.infer<typeof adminUserSchemas.update>;

import { z } from 'zod';

export const adminPackSchemas = {
  create: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    credits: z.number().int().positive(),
    price: z.number().positive(),
    description: z.string().optional(),
    isActive: z.boolean().default(true).optional()
  }),
  update: z.object({
    id: z.string().uuid(),
    name: z.string().min(1).optional(),
    credits: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  }),
  remove: z.object({
    id: z.string().uuid()
  })
};

export type AdminPackInput = z.infer<typeof adminPackSchemas.create>;

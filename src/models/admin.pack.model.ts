import { z } from 'zod';

const basePackSchema = z.object({
  name: z.string().min(1),
  credits: z.number().int().positive(),
  price: z.number().positive(),
  description: z.string().optional(),
  isActive: z.boolean().default(true).optional()
});

export const adminPackSchemas = {
  create: basePackSchema.extend({
    id: z.string().uuid().optional()
  }),
  update: basePackSchema.partial().extend({
    id: z.string().uuid()
  }),
  remove: z.object({
    id: z.string().uuid()
  })
};

export type AdminPackCreateInput = z.infer<typeof adminPackSchemas.create>;
export type AdminPackUpdateInput = z.infer<typeof adminPackSchemas.update>;
export type AdminPack = AdminPackCreateInput & { id: string };

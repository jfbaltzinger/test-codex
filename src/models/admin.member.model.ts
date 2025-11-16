import { z } from 'zod';

export const adminMemberSchemas = {
  create: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    status: z.enum(['active', 'inactive']),
    credits: z.number().int().nonnegative(),
    membershipType: z.string().min(1)
  }),
  update: z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    credits: z.number().int().nonnegative().optional(),
    membershipType: z.string().min(1).optional()
  }),
  remove: z.object({
    id: z.string().uuid()
  })
};

export type AdminMemberCreateInput = z.infer<typeof adminMemberSchemas.create>;
export type AdminMemberUpdateInput = z.infer<typeof adminMemberSchemas.update>;

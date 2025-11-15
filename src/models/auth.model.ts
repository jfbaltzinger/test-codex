import { z } from 'zod';

export const authSchemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  refresh: z.object({
    refreshToken: z.string().min(1)
  })
};

export type RegisterInput = z.infer<typeof authSchemas.register>;

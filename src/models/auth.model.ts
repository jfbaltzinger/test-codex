import { z } from 'zod';

export const authSchemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['member', 'admin']).optional()
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  refresh: z.object({
    refreshToken: z.string().min(1)
  }),
  requestPasswordReset: z.object({
    email: z.string().email(),
    redirectUrl: z.string().url()
  }),
  resetPassword: z.object({
    token: z.string().min(10),
    password: z.string().min(8)
  })
};

export type RegisterInput = z.infer<typeof authSchemas.register>;
export type LoginInput = z.infer<typeof authSchemas.login>;
export type RequestPasswordResetInput = z.infer<typeof authSchemas.requestPasswordReset>;
export type ResetPasswordInput = z.infer<typeof authSchemas.resetPassword>;

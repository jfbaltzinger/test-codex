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
  }),
  updateProfile: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    emergencyContact: z.string().min(3).optional()
  }),
  updatePassword: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
  })
};

export type RegisterInput = z.infer<typeof authSchemas.register>;
export type LoginInput = z.infer<typeof authSchemas.login>;
export type RequestPasswordResetInput = z.infer<typeof authSchemas.requestPasswordReset>;
export type ResetPasswordInput = z.infer<typeof authSchemas.resetPassword>;
export type UpdateProfileInput = z.infer<typeof authSchemas.updateProfile>;
export type UpdatePasswordInput = z.infer<typeof authSchemas.updatePassword>;

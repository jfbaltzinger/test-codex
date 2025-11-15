import { z } from 'zod';

export const paymentSchemas = {
  createCheckoutSession: z.object({
    packId: z.string().uuid('Invalid pack id'),
    successUrl: z.string().url('Invalid success URL').optional(),
    cancelUrl: z.string().url('Invalid cancel URL').optional()
  })
};

export type CreateCheckoutSessionInput = z.infer<typeof paymentSchemas.createCheckoutSession>;

import { z } from 'zod';

export const creditSchemas = {
  purchase: z.object({
    packId: z.string().uuid('Invalid pack id')
  })
};

export type CreditPurchaseInput = z.infer<typeof creditSchemas.purchase>;

import { z } from 'zod';

export const reservationSchemas = {
  create: z.object({
    sessionId: z.string()
  }),
  cancel: z.object({
    id: z.string()
  })
};

export type Reservation = {
  id: string;
  userId: string;
  sessionId: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
};

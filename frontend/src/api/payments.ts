import api from './client';

export interface CreateCheckoutSessionPayload {
  packId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = async (
  payload: CreateCheckoutSessionPayload
): Promise<CreateCheckoutSessionResponse> => {
  const { data } = await api.post<CreateCheckoutSessionResponse>(
    '/payments/create-checkout-session',
    payload
  );
  return data;
};

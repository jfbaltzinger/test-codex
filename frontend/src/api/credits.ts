import api from './client';

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description?: string;
}

export interface CreditHistoryItem {
  id: string;
  type: 'purchase' | 'spend';
  credits: number;
  createdAt: string;
  bookingId?: string;
  packName?: string;
}

export const getCreditPacks = async (): Promise<CreditPack[]> => {
  const { data } = await api.get<CreditPack[]>('/credits/packs');
  return data;
};

export const createStripeCheckout = async (packId: string) => {
  const { data } = await api.post<{ checkoutUrl: string }>(
    '/payments/stripe/checkout',
    { packId }
  );
  return data.checkoutUrl;
};

export const getCreditHistory = async (): Promise<CreditHistoryItem[]> => {
  const { data } = await api.get<CreditHistoryItem[]>('/credits/history');
  return data;
};

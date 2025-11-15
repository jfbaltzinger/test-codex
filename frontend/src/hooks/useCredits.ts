import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreditHistoryItem,
  CreditPack,
  getCreditHistory,
  getCreditPacks,
} from '@/api/credits';
import {
  CreateCheckoutSessionPayload,
  CreateCheckoutSessionResponse,
  createCheckoutSession,
} from '@/api/payments';
import { useToast } from '@/hooks/useToast';

export const useCreditPacks = () =>
  useQuery<CreditPack[]>({
    queryKey: ['credits', 'packs'],
    queryFn: getCreditPacks,
  });

export const useCreditHistory = () =>
  useQuery<CreditHistoryItem[]>({
    queryKey: ['credits', 'history'],
    queryFn: getCreditHistory,
  });

export const useStripeCheckout = () => {
  const toast = useToast();

  return useMutation<CreateCheckoutSessionResponse, unknown, CreateCheckoutSessionPayload>({
    mutationFn: (payload) => createCheckoutSession(payload),
    onError: () => {
      toast.error("Le paiement n'a pas pu être initié. Réessayez.");
    },
  });
};

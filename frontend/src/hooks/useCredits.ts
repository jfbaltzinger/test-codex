import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreditHistoryItem,
  CreditPack,
  createStripeCheckout,
  getCreditHistory,
  getCreditPacks,
} from '@/api/credits';
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

  return useMutation({
    mutationFn: (packId: string) => createStripeCheckout(packId),
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },
    onError: () => {
      toast.error("Le paiement n'a pas pu être initié. Réessayez.");
    },
  });
};

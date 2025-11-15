import React from 'react';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreditPacks, useStripeCheckout } from '@/hooks/useCredits';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';

interface BuyCreditsProps {
  className?: string;
  successUrl?: string;
  cancelUrl?: string;
  title?: string;
  description?: string;
  onCheckoutCreated?: (details: { sessionId: string; packId: string }) => void;
}

export const BuyCredits: React.FC<BuyCreditsProps> = ({
  className,
  successUrl,
  cancelUrl,
  title = 'Acheter des crédits',
  description =
    'Choisissez le pack adapté à votre rythme. Le paiement est sécurisé via Stripe.',
  onCheckoutCreated,
}) => {
  const { data: packs, isLoading, isError } = useCreditPacks();
  const userCredits = useAuthStore((state) => state.user?.credits ?? 0);
  const stripeCheckout = useStripeCheckout();
  const toast = useToast();

  const handleCheckout = (packId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const payload = {
      packId,
      successUrl: successUrl ?? (origin ? `${origin}/payments/success` : undefined),
      cancelUrl: cancelUrl ?? (origin ? `${origin}/payments/cancel` : undefined),
    };

    stripeCheckout.mutate(payload, {
      onSuccess: ({ url, sessionId }) => {
        onCheckoutCreated?.({ sessionId, packId });
        if (url) {
          window.location.href = url;
        } else {
          toast.error('Impossible de rediriger vers la page de paiement.');
        }
      },
    });
  };

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
        <Card className="flex flex-col gap-2 p-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Crédits actuels</p>
            <p className="text-2xl font-semibold text-primary-600">{userCredits}</p>
          </div>
          <p className="text-xs text-slate-500">
            Besoin d'aide ? Contactez le support pour des packs personnalisés pour votre équipe.
          </p>
        </Card>
      </div>

      {isLoading && (
        <Card className="p-4 text-sm text-slate-400">Chargement des packs...</Card>
      )}

      {isError && (
        <Card className="p-4 text-sm text-red-500">
          Impossible de récupérer les packs de crédits.
        </Card>
      )}

      {!isLoading && !isError && (!packs || packs.length === 0) && (
        <Card className="p-4 text-sm text-slate-500">
          Aucun pack disponible pour le moment. Revenez bientôt.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {packs?.map((pack) => (
          <Card key={pack.id} className="flex flex-col justify-between space-y-4 p-6">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900">{pack.name}</p>
              {pack.description && (
                <p className="text-sm text-slate-500">{pack.description}</p>
              )}
              <p className="text-3xl font-bold text-primary-600">
                {pack.price.toFixed(2)} €
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {pack.credits} crédits
              </p>
            </div>
            <Button
              disabled={stripeCheckout.isPending}
              onClick={() => handleCheckout(pack.id)}
              className="w-full"
            >
              {stripeCheckout.isPending ? 'Redirection...' : 'Acheter'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BuyCredits;

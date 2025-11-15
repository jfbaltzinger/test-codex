import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreditPacks } from '@/hooks/useCredits';
import { useAuthStore } from '@/store/authStore';
import { useStripeCheckout } from '@/hooks/useCredits';

export const CreditsPage = () => {
  const { data: packs, isLoading, isError } = useCreditPacks();
  const user = useAuthStore((state) => state.user);
  const stripeCheckout = useStripeCheckout();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-slate-900">Acheter des crédits</h1>
        <p className="text-sm text-slate-500">
          Choisissez le pack adapté à votre rythme. Le paiement est sécurisé via Stripe.
        </p>
        <Card className="flex flex-col gap-2 p-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Crédits actuels</p>
            <p className="text-2xl font-semibold text-primary-600">{user?.credits ?? 0}</p>
          </div>
          <p className="text-xs text-slate-500">
            Besoin d'aide ? Contactez le support pour des packs personnalisés pour votre équipe.
          </p>
        </Card>
      </div>

      {isLoading && <Card className="p-4 text-sm text-slate-400">Chargement des packs...</Card>}
      {isError && <Card className="p-4 text-sm text-red-500">Impossible de récupérer les packs de crédits.</Card>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {packs?.map((pack) => (
          <Card key={pack.id} className="flex flex-col justify-between space-y-4 p-6">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900">{pack.name}</p>
              <p className="text-sm text-slate-500">{pack.description}</p>
              <p className="text-3xl font-bold text-primary-600">{pack.price.toFixed(2)} €</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{pack.credits} crédits</p>
            </div>
            <Button
              disabled={stripeCheckout.isPending}
              onClick={() => stripeCheckout.mutate(pack.id)}
              className="w-full"
            >
              {stripeCheckout.isPending ? 'Redirection...' : 'Acheter' }
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

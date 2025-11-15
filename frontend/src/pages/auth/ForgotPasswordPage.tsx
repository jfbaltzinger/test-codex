import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRequestPasswordReset } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const mutation = useRequestPasswordReset();
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      await mutation.mutateAsync({ email, redirectUrl });
      toast.success('Un e-mail de réinitialisation vient de vous être envoyé.');
    } catch (error) {
      toast.error('Impossible d’envoyer le mail pour le moment. Réessayez plus tard.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Mot de passe oublié ?</h1>
          <p className="mt-2 text-sm text-slate-500">
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Adresse e-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Envoi en cours...' : 'Recevoir le lien'}
          </Button>
          <div className="text-center text-sm">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

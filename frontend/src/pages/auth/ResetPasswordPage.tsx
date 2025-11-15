import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useResetPassword } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const mutation = useResetPassword();
  const toast = useToast();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      toast.error('Le lien de réinitialisation est invalide ou expiré.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await mutation.mutateAsync({ token, password });
      toast.success('Votre mot de passe a été mis à jour. Vous êtes maintenant connecté(e).');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Impossible de réinitialiser votre mot de passe. Le lien semble invalide ou expiré.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Définir un nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-slate-500">
            Choisissez un mot de passe solide afin de sécuriser votre espace adhérent.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nouveau mot de passe"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Input
            label="Confirmez le mot de passe"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Réinitialisation...' : 'Valider'}
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

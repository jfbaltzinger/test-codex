import { useState } from 'react';
import { useNavigate, useLocation, Navigate, type Location } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success('Connexion réussie !');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Identifiants incorrects. Veuillez vérifier vos informations.");
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Bienvenue dans l'espace adhérent</h1>
          <p className="mt-2 text-sm text-slate-500">Accédez à vos réservations et suivez vos crédits.</p>
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
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { updatePassword, updateProfile } from '@/api/profile';
import { useToast } from '@/hooks/useToast';

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: '',
    emergencyContact: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      if (token) {
        setCredentials({ token, user: updated });
      } else {
        updateUser(updated);
      }
      toast.success('Profil mis à jour avec succès');
    },
    onError: () => {
      toast.error('Impossible de mettre à jour le profil.');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Mot de passe mis à jour.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => {
      toast.error('La mise à jour du mot de passe a échoué.');
    },
  });

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    profileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Mon profil</h1>
        <p className="text-sm text-slate-500">Mettez à jour vos informations personnelles et votre mot de passe.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Informations personnelles</h2>
            <p className="text-sm text-slate-500">Ces informations seront utilisées pour vos réservations.</p>
          </div>
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <Input
              label="Prénom"
              value={profileForm.firstName}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
              required
            />
            <Input
              label="Nom"
              value={profileForm.lastName}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
              required
            />
            <Input
              label="Téléphone"
              value={profileForm.phone}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="06 12 34 56 78"
            />
            <Input
              label="Contact d'urgence"
              value={profileForm.emergencyContact}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, emergencyContact: event.target.value }))
              }
              placeholder="Nom et téléphone"
            />
            <Button type="submit" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sécurité</h2>
            <p className="text-sm text-slate-500">Changez votre mot de passe régulièrement pour plus de sécurité.</p>
          </div>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <Input
              label="Mot de passe actuel"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              required
            />
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              required
            />
            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              required
            />
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

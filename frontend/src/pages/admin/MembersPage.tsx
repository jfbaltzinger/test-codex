import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TwoColumnPage } from '@/components/layout/TwoColumnPage';
import {
  AdminMember,
  createMember,
  deleteMember,
  getMembers,
  MemberPayload,
  updateMember,
} from '@/api/admin';

const defaultForm: MemberPayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'active',
  credits: 0,
  membershipType: 'standard',
};

export const MembersPage = () => {
  const queryClient = useQueryClient();
  const membersQuery = useQuery<AdminMember[]>({
    queryKey: ['admin', 'members'],
    queryFn: getMembers,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [form, setForm] = useState<MemberPayload>(defaultForm);

  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MemberPayload }) => updateMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
      setIsDeleteOpen(false);
    },
  });

  const openCreateModal = () => {
    setSelectedMember(null);
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const openEditModal = (member: AdminMember) => {
    setSelectedMember(member);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      status: member.status,
      credits: member.credits,
      membershipType: member.membershipType,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (selectedMember) {
      updateMutation.mutate({ id: selectedMember.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (member: AdminMember) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedMember) return;
    deleteMutation.mutate(selectedMember.id);
  };

  const handleFieldChange = (key: keyof MemberPayload, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === 'credits' ? Number(value) : value,
    }));
  };

  return (
    <>
      <TwoColumnPage
        main={
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Gestion des adhérents</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Créez, mettez à jour et suivez vos adhérents actifs.
                </p>
              </div>
              <Button onClick={openCreateModal}>Nouvel adhérent</Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Adhérent</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium">Crédits</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Inscription</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {membersQuery.isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          Chargement des adhérents...
                        </td>
                      </tr>
                    ) : membersQuery.data && membersQuery.data.length > 0 ? (
                      membersQuery.data.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {member.firstName} {member.lastName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <div>{member.email}</div>
                            <div className="text-xs text-slate-400">{member.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                member.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {member.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{member.credits}</td>
                          <td className="px-4 py-3 text-slate-600 capitalize">{member.membershipType}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {format(new Date(member.joinedAt), 'd MMM yyyy', { locale: fr })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="secondary" onClick={() => openEditModal(member)}>
                                Modifier
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(member)}>
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          Aucun adhérent trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        }
        sidebar={
          <>
            <Card>
              <h3 className="text-base font-semibold text-slate-900">Filtres rapides</h3>
              <p className="mt-2 text-sm text-slate-500">
                Utilisez les filtres pour cibler les adhérents à relancer.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-800">Relances automatiques</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Identifiez les adhérents inactifs depuis plus de 30 jours pour leur envoyer une offre.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-800">Crédits faibles</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Détectez les comptes à moins de 5 crédits pour leur proposer un pack adapté.
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-slate-900">Règles de sécurité</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Seuls les administrateurs peuvent modifier un compte adhérent.</li>
                <li>Les suppressions sont définitives, pensez à exporter les données si besoin.</li>
                <li>Conservez un historique des échanges pour assurer le suivi.</li>
              </ul>
            </Card>
          </>
        }
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedMember ? 'Modifier un adhérent' : 'Créer un adhérent'}
        confirmLabel={selectedMember ? 'Mettre à jour' : 'Créer'}
        onConfirm={handleFormSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prénom"
            value={form.firstName}
            onChange={(event) => handleFieldChange('firstName', event.target.value)}
            required
          />
          <Input
            label="Nom"
            value={form.lastName}
            onChange={(event) => handleFieldChange('lastName', event.target.value)}
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => handleFieldChange('email', event.target.value)}
          required
        />
        <Input
          label="Téléphone"
          value={form.phone}
          onChange={(event) => handleFieldChange('phone', event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-slate-700">Statut</label>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              value={form.status}
              onChange={(event) => handleFieldChange('status', event.target.value)}
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
          <Input
            label="Crédits"
            type="number"
            min={0}
            value={form.credits}
            onChange={(event) => handleFieldChange('credits', event.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-slate-700">Type d’adhésion</label>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={form.membershipType}
            onChange={(event) => handleFieldChange('membershipType', event.target.value)}
          >
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmer la suppression"
        description="Cette action est irréversible. L’adhérent et ses réservations associées seront supprimés."
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        confirmLoading={deleteMutation.isPending}
      >
        <p className="text-sm text-slate-600">
          Êtes-vous sûr de vouloir supprimer{' '}
          <span className="font-semibold text-slate-900">
            {selectedMember?.firstName} {selectedMember?.lastName}
          </span>
          ?
        </p>
      </Modal>
    </>
  );
};

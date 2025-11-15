import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TwoColumnPage } from '@/components/layout/TwoColumnPage';
import {
  AdminCreditPack,
  CreditPackPayload,
  createCreditPack,
  deleteCreditPack,
  getCreditPacks,
  updateCreditPack,
} from '@/api/admin';

const defaultPack: CreditPackPayload = {
  name: '',
  credits: 10,
  price: 0,
  description: '',
  isActive: true,
};

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export const CreditPacksPage = () => {
  const queryClient = useQueryClient();
  const packsQuery = useQuery<AdminCreditPack[]>({
    queryKey: ['admin', 'credit-packs'],
    queryFn: getCreditPacks,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<AdminCreditPack | null>(null);
  const [form, setForm] = useState<CreditPackPayload>(defaultPack);

  const createMutation = useMutation({
    mutationFn: createCreditPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-packs'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreditPackPayload }) => updateCreditPack(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-packs'] });
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCreditPack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-packs'] });
      setIsDeleteOpen(false);
    },
  });

  const openCreateModal = () => {
    setSelectedPack(null);
    setForm(defaultPack);
    setIsFormOpen(true);
  };

  const openEditModal = (pack: AdminCreditPack) => {
    setSelectedPack(pack);
    setForm({
      name: pack.name,
      credits: pack.credits,
      price: pack.price,
      description: pack.description ?? '',
      isActive: pack.isActive,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (selectedPack) {
      updateMutation.mutate({ id: selectedPack.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const confirmDelete = () => {
    if (!selectedPack) return;
    deleteMutation.mutate(selectedPack.id);
  };

  const handleFieldChange = (key: keyof CreditPackPayload, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === 'credits' || key === 'price' ? Number(value) : value,
    }));
  };

  return (
    <>
      <TwoColumnPage
        main={
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Packs de crédits</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Configurez les offres disponibles pour vos adhérents.
                </p>
              </div>
              <Button onClick={openCreateModal}>Nouveau pack</Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Pack</th>
                      <th className="px-4 py-3 font-medium">Crédits</th>
                      <th className="px-4 py-3 font-medium">Prix</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {packsQuery.isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          Chargement des packs de crédits...
                        </td>
                      </tr>
                    ) : packsQuery.data && packsQuery.data.length > 0 ? (
                      packsQuery.data.map((pack) => (
                        <tr key={pack.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{pack.name}</td>
                          <td className="px-4 py-3 text-slate-600">{pack.credits}</td>
                          <td className="px-4 py-3 text-slate-600">{currencyFormatter.format(pack.price)}</td>
                          <td className="px-4 py-3 text-slate-600">{pack.description ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                pack.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {pack.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="secondary" onClick={() => openEditModal(pack)}>
                                Modifier
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPack(pack);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          Aucun pack de crédits n’a encore été configuré.
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
              <h3 className="text-base font-semibold text-slate-900">Conseils tarifaires</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Proposez 3 packs minimum pour couvrir les besoins principaux.</li>
                <li>Utilisez un prix psychologique (ex. 99€) pour booster la conversion.</li>
                <li>Activez/désactivez un pack selon les périodes commerciales.</li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-slate-900">Statistiques</h3>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase text-slate-400">Panier moyen</p>
                  <p className="text-lg font-semibold text-slate-900">{currencyFormatter.format(89)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Pack best-seller</p>
                  <p className="text-sm font-medium text-slate-800">Pack Intensif 20 crédits</p>
                </div>
              </div>
            </Card>
          </>
        }
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedPack ? 'Modifier un pack' : 'Créer un pack'}
        confirmLabel={selectedPack ? 'Mettre à jour' : 'Créer'}
        onConfirm={handleFormSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Input
          label="Nom du pack"
          value={form.name}
          onChange={(event) => handleFieldChange('name', event.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre de crédits"
            type="number"
            min={1}
            value={form.credits}
            onChange={(event) => handleFieldChange('credits', event.target.value)}
          />
          <Input
            label="Prix"
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(event) => handleFieldChange('price', event.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={form.description}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            placeholder="Mettez en avant les bénéfices du pack"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-slate-800">Pack disponible à la vente</p>
            <p className="text-xs text-slate-500">Désactivez pour le retirer temporairement de la boutique.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              checked={form.isActive}
              onChange={(event) => handleFieldChange('isActive', event.target.checked)}
            />
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Supprimer le pack"
        description="Vous êtes sur le point de retirer définitivement ce pack de crédits."
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        confirmLoading={deleteMutation.isPending}
      >
        <p className="text-sm text-slate-600">
          Confirmez-vous la suppression du pack{' '}
          <span className="font-semibold text-slate-900">{selectedPack?.name}</span> ?
        </p>
      </Modal>
    </>
  );
};

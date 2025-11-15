import { Tab } from '@headlessui/react';
import { Card } from '@/components/ui/Card';
import { useBookingHistory } from '@/hooks/useBookings';
import { useCreditHistory } from '@/hooks/useCredits';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

const tabs = ['Cours', 'Crédits'] as const;

export const HistoryPage = () => {
  const { data: bookingHistory, isLoading: bookingsLoading } = useBookingHistory();
  const { data: creditHistory, isLoading: creditsLoading } = useCreditHistory();

  const renderBookings = () => (
    <div className="space-y-3">
      {bookingsLoading && <Card className="p-4 text-sm text-slate-400">Chargement de l'historique...</Card>}
      {!bookingsLoading && bookingHistory && bookingHistory.length === 0 && (
        <Card className="p-4 text-sm text-slate-500">Aucun cours suivi pour le moment.</Card>
      )}
      {bookingHistory?.map((item) => (
        <Card key={item.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.courseName}</p>
            <p className="text-xs text-slate-500">Coach : {item.coachName}</p>
          </div>
          <div className="text-sm text-slate-500">
            {format(parseISO(item.start), "EEE d MMM yyyy", { locale: fr })} •
            {format(parseISO(item.start), " HH'h'mm", { locale: fr })}
          </div>
          <div className="text-sm font-medium text-primary-600">-{item.creditsUsed} crédits</div>
        </Card>
      ))}
    </div>
  );

  const renderCredits = () => (
    <div className="space-y-3">
      {creditsLoading && <Card className="p-4 text-sm text-slate-400">Chargement des mouvements...</Card>}
      {!creditsLoading && creditHistory && creditHistory.length === 0 && (
        <Card className="p-4 text-sm text-slate-500">Aucun mouvement de crédits.</Card>
      )}
      {creditHistory?.map((item) => (
        <Card key={item.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {item.type === 'purchase' ? `Achat ${item.packName ?? ''}` : 'Utilisation de crédits'}
            </p>
            <p className="text-xs text-slate-500">
              {format(parseISO(item.createdAt), "EEE d MMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className={clsx('text-sm font-medium', item.type === 'purchase' ? 'text-emerald-600' : 'text-primary-600')}>
            {item.type === 'purchase' ? '+' : '-'}
            {item.credits} crédits
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Historique</h1>
        <p className="text-sm text-slate-500">Retrouvez vos cours passés et vos achats de crédits.</p>
      </div>
      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-full bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                clsx(
                  'w-full rounded-full px-4 py-2 text-sm font-medium transition',
                  selected ? 'bg-primary-600 text-white shadow' : 'text-slate-600 hover:text-primary-600'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>{renderBookings()}</Tab.Panel>
          <Tab.Panel>{renderCredits()}</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

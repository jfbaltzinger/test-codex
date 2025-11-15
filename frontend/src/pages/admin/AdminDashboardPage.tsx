import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TwoColumnPage } from '@/components/layout/TwoColumnPage';
import {
  DashboardMetrics,
  getDashboardMetrics,
  getOccupancySnapshots,
  OccupancySnapshot,
} from '@/api/admin';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const useDashboardData = () => {
  const metricsQuery = useQuery<DashboardMetrics>({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardMetrics,
  });

  const occupancyQuery = useQuery<OccupancySnapshot[]>({
    queryKey: ['admin', 'occupancy'],
    queryFn: getOccupancySnapshots,
  });

  return { metricsQuery, occupancyQuery };
};

const kpiFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export const AdminDashboardPage = () => {
  const { metricsQuery, occupancyQuery } = useDashboardData();

  const kpis = useMemo(() => {
    if (!metricsQuery.data) {
      return [];
    }
    return [
      {
        label: 'Réservations confirmées',
        value: kpiFormatter.format(metricsQuery.data.totalBookings),
        helper: 'Sur les 30 derniers jours',
      },
      {
        label: 'Chiffre d’affaires généré',
        value: currencyFormatter.format(metricsQuery.data.revenue),
        helper: 'Paiements encaissés sur la période',
      },
      {
        label: 'Crédits vendus',
        value: kpiFormatter.format(metricsQuery.data.creditsSold),
        helper: 'Packs de crédits payés',
      },
      {
        label: 'Taux de remplissage moyen',
        value: `${metricsQuery.data.occupancyRate.toFixed(0)}%`,
        helper: 'Moyenne toutes sessions confondues',
      },
      {
        label: 'Adhérents actifs',
        value: kpiFormatter.format(metricsQuery.data.activeMembers),
        helper: 'Comptes en statut actif',
      },
      {
        label: 'Sessions à venir',
        value: kpiFormatter.format(metricsQuery.data.upcomingSessions),
        helper: 'Sur les 7 prochains jours',
      },
    ];
  }, [metricsQuery.data]);

  return (
    <TwoColumnPage
      main={
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metricsQuery.isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse space-y-2">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="h-6 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </Card>
                ))
              : kpis.map((kpi) => (
                  <Card key={kpi.label}>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{kpi.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{kpi.value}</p>
                    <p className="mt-2 text-xs text-slate-500">{kpi.helper}</p>
                  </Card>
                ))}
          </section>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Sessions à surveiller</h2>
                <p className="text-sm text-slate-500">
                  Priorisez les sessions proches de la saturation ou avec un remplissage faible.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowPathIcon className="h-4 w-4" />}
                onClick={() => occupancyQuery.refetch()}
              >
                Actualiser
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cours</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Réservations</th>
                    <th className="px-4 py-3 font-medium">Capacité</th>
                    <th className="px-4 py-3 font-medium">Remplissage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {occupancyQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        Chargement des données...
                      </td>
                    </tr>
                  ) : occupancyQuery.data && occupancyQuery.data.length > 0 ? (
                    occupancyQuery.data.map((snapshot) => {
                      const occupancy = snapshot.capacity
                        ? Math.round((snapshot.bookedSpots / snapshot.capacity) * 100)
                        : 0;
                      return (
                        <tr key={snapshot.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{snapshot.courseName}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {format(new Date(snapshot.sessionDate), "EEEE d MMM 'à' HH'h'mm", { locale: fr })}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{snapshot.bookedSpots}</td>
                          <td className="px-4 py-3 text-slate-600">{snapshot.capacity}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor: occupancy >= 80 ? 'rgba(22, 101, 52, 0.12)' : 'rgba(30, 64, 175, 0.12)',
                                color: occupancy >= 80 ? '#166534' : '#1E40AF',
                              }}
                            >
                              {occupancy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        Aucune session à analyser pour le moment.
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
            <h3 className="text-base font-semibold text-slate-900">Actions rapides</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Button asChild size="sm" className="w-full justify-center">
                <a href="/members">Créer un adhérent</a>
              </Button>
              <Button asChild size="sm" variant="secondary" className="w-full justify-center">
                <a href="/courses">Programmer un cours</a>
              </Button>
              <Button asChild size="sm" variant="ghost" className="w-full justify-center">
                <a href="/reports">Exporter les réservations</a>
              </Button>
            </div>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-slate-900">Conseils de pilotage</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Relancez les cours avec moins de 40% de remplissage.</li>
              <li>Proposez des offres ciblées sur les packs les plus performants.</li>
              <li>Analysez les heures de pointe pour ajuster le planning.</li>
            </ul>
          </Card>
        </>
      }
    />
  );
};

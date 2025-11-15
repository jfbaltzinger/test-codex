import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TwoColumnPage } from '@/components/layout/TwoColumnPage';
import { exportBookings, getOccupancySnapshots, OccupancySnapshot } from '@/api/admin';
import { useToast } from '@/components/feedback/ToastProvider';

interface OccupancyByCourse {
  courseName: string;
  sessions: number;
  averageOccupancy: number;
}

const formatFilename = (formatType: 'csv' | 'xlsx') => {
  const now = format(new Date(), 'yyyy-MM-dd');
  return `reservations-${now}.${formatType === 'csv' ? 'csv' : 'xlsx'}`;
};

export const ReportsPage = () => {
  const toast = useToast();
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);
  const occupancyQuery = useQuery<OccupancySnapshot[]>({
    queryKey: ['admin', 'occupancy'],
    queryFn: getOccupancySnapshots,
  });

  const occupancyByCourse = useMemo<OccupancyByCourse[]>(() => {
    if (!occupancyQuery.data) {
      return [];
    }
    const grouped = occupancyQuery.data.reduce<Record<string, { sessions: number; ratio: number }>>(
      (acc, item) => {
        const occupancy = item.capacity ? item.bookedSpots / item.capacity : 0;
        const current = acc[item.courseName] ?? { sessions: 0, ratio: 0 };
        return {
          ...acc,
          [item.courseName]: {
            sessions: current.sessions + 1,
            ratio: current.ratio + occupancy,
          },
        };
      },
      {}
    );

    return Object.entries(grouped)
      .map(([courseName, { sessions, ratio }]) => ({
        courseName,
        sessions,
        averageOccupancy: sessions > 0 ? Math.round((ratio / sessions) * 100) : 0,
      }))
      .sort((a, b) => b.averageOccupancy - a.averageOccupancy);
  }, [occupancyQuery.data]);

  const handleExport = async (formatType: 'csv' | 'xlsx') => {
    try {
      setExporting(formatType);
      const blob = await exportBookings(formatType);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = formatFilename(formatType);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Export généré avec succès.');
    } catch (error) {
      toast.error("Impossible de générer l'export. Réessayez plus tard.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <TwoColumnPage
      main={
        <>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Reporting & exports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Analysez les taux de remplissage et exportez vos réservations pour un suivi détaillé.
            </p>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Taux de remplissage par cours</h2>
                <p className="text-sm text-slate-500">
                  Classement des cours selon leur taux de remplissage moyen.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => occupancyQuery.refetch()}>
                Actualiser
              </Button>
            </div>
            <div className="space-y-3">
              {occupancyQuery.isLoading ? (
                <p className="text-sm text-slate-400">Chargement des données...</p>
              ) : occupancyByCourse.length > 0 ? (
                occupancyByCourse.map((item) => (
                  <div key={item.courseName} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.courseName}</p>
                        <p className="text-xs text-slate-500">{item.sessions} sessions analysées</p>
                      </div>
                      <span className="text-xl font-semibold text-primary-600">{item.averageOccupancy}%</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{ width: `${item.averageOccupancy}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Aucune donnée de remplissage disponible pour le moment.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Sessions récentes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Consultez le taux de remplissage de vos dernières sessions programmées.
            </p>
            <div className="mt-4 overflow-x-auto">
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
                        Chargement des sessions...
                      </td>
                    </tr>
                  ) : occupancyQuery.data && occupancyQuery.data.length > 0 ? (
                    occupancyQuery.data.slice(0, 8).map((snapshot) => {
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
                        Aucune session enregistrée.
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
            <h3 className="text-base font-semibold text-slate-900">Exports des réservations</h3>
            <p className="mt-2 text-sm text-slate-500">
              Téléchargez vos réservations pour les analyser dans Excel ou un outil BI.
            </p>
            <div className="mt-4 space-y-3">
              <Button
                className="w-full justify-center"
                onClick={() => handleExport('csv')}
                disabled={exporting !== null}
              >
                {exporting === 'csv' ? 'Export en cours...' : 'Exporter en CSV'}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleExport('xlsx')}
                disabled={exporting !== null}
              >
                {exporting === 'xlsx' ? 'Export en cours...' : 'Exporter en Excel'}
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Les exports incluent les informations de réservation, le statut et l’identifiant des membres.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-slate-900">Astuces data</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Analysez l’évolution hebdomadaire du taux de remplissage pour anticiper les pics.</li>
              <li>Comparez les performances des cours et adaptez vos créneaux horaires.</li>
              <li>Partagez les exports avec les coachs pour qu’ils ajustent leur communication.</li>
            </ul>
          </Card>
        </>
      }
    />
  );
};

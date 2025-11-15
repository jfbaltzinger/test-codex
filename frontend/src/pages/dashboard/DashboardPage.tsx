import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUpcomingBookings } from '@/hooks/useBookings';
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const { data: bookings, isLoading, isError, refetch } = useUpcomingBookings();

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Crédits disponibles</p>
          <p className="mt-2 text-3xl font-semibold text-primary-600">{user?.credits ?? 0}</p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/credits">Recharger mes crédits</Link>
          </Button>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Prochain cours</p>
          {isLoading ? (
            <p className="mt-2 text-sm text-slate-400">Chargement...</p>
          ) : isError ? (
            <p className="mt-2 text-sm text-red-500">Erreur lors du chargement des réservations.</p>
          ) : bookings && bookings.length > 0 ? (
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{bookings[0].courseName}</p>
              <p>{format(parseISO(bookings[0].start), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}</p>
              <p className="capitalize text-slate-500">Statut : {bookings[0].status}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Aucune réservation à venir.</p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Besoin d'un nouveau cours ?</p>
          <p className="mt-2 text-sm text-slate-600">
            Consultez le calendrier pour réserver un créneau selon vos disponibilités.
          </p>
          <Button asChild className="mt-4">
            <Link to="/calendar">Voir le calendrier</Link>
          </Button>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Mes prochaines réservations</h2>
          <Button variant="ghost" size="sm" icon={<ArrowPathIcon className="h-4 w-4" />} onClick={() => refetch()}>
            Actualiser
          </Button>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-4 text-sm text-slate-400">Chargement des réservations...</Card>
          ) : isError ? (
            <Card className="p-4 text-sm text-red-500">Impossible de charger les réservations.</Card>
          ) : bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking.id} className="flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{booking.courseName}</p>
                  <p className="text-sm text-slate-500">
                    {format(parseISO(booking.start), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center space-x-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span className="capitalize">{booking.status}</span>
                  </span>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/booking">Gérer</Link>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-4 text-sm text-slate-500">Vous n'avez aucune réservation à venir.</Card>
          )}
        </div>
      </section>
    </div>
  );
};

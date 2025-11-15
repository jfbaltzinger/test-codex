import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useBookingSlots } from '@/hooks/useBookings';
import { format, isSameDay, parseISO, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

const VIEW_MODES = [
  { value: 'calendar', label: 'Calendrier' },
  { value: 'list', label: 'Liste' },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]['value'];

export const CalendarPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const { data: slots, isLoading, isError, refetch } = useBookingSlots();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Calendrier des cours</h1>
          <p className="text-sm text-slate-500">Visualisez les créneaux disponibles et réservez en un clic.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setViewMode(mode.value)}
              className={clsx(
                'rounded-full px-4 py-1 text-sm font-medium transition',
                viewMode === mode.value ? 'bg-primary-600 text-white shadow' : 'text-slate-600 hover:text-primary-600'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Card className="p-4 text-sm text-slate-400">Chargement des créneaux...</Card>}
      {isError && (
        <Card className="flex items-center justify-between p-4 text-sm text-red-500">
          <span>Impossible de récupérer les créneaux. Vérifiez votre connexion.</span>
          <Button size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </Card>
      )}

      {!isLoading && !isError && slots && (
        <div>
          {viewMode === 'calendar' ? (
            <>
              <div className="hidden gap-4 md:grid md:grid-cols-7">
                {days.map((day) => (
                  <div key={day.toISOString()} className="space-y-3">
                    <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                      <p className="text-xs uppercase text-slate-400">{format(day, 'EEEE', { locale: fr })}</p>
                      <p className="text-lg font-semibold text-slate-900">{format(day, 'd')}</p>
                    </div>
                    <div className="space-y-3">
                      {slots.filter((slot) => isSameDay(parseISO(slot.start), day)).length === 0 && (
                        <Card className="p-3 text-xs text-slate-400">Aucun créneau</Card>
                      )}
                      {slots
                        .filter((slot) => isSameDay(parseISO(slot.start), day))
                        .map((slot) => (
                          <Card key={slot.id} className="space-y-2 p-3 text-xs">
                            <p className="text-sm font-semibold text-slate-900">{slot.courseName}</p>
                            <p className="text-slate-500">
                              {format(parseISO(slot.start), "HH'h'mm", { locale: fr })} -
                              {format(parseISO(slot.end), " HH'h'mm", { locale: fr })}
                            </p>
                            <p className="text-slate-500">Coach : {slot.coachName}</p>
                            <p className="text-slate-500">{slot.location}</p>
                            <Button asChild size="sm" className="w-full">
                              <Link to={`/booking?slot=${slot.id}`}>Réserver</Link>
                            </Button>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <Card className="p-4 text-sm text-slate-500 md:hidden">
                Le mode calendrier est optimisé pour tablette et desktop. Passez en mode liste sur mobile.
              </Card>
            </>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <Card key={slot.id} className="space-y-2 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-900">{slot.courseName}</p>
                    <span className="text-xs text-slate-500">
                      {format(parseISO(slot.start), "EEE d MMM", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {format(parseISO(slot.start), "HH'h'mm", { locale: fr })} -
                    {format(parseISO(slot.end), " HH'h'mm", { locale: fr })}
                  </p>
                  <p className="text-xs text-slate-500">Coach : {slot.coachName}</p>
                  <p className="text-xs text-slate-500">{slot.location}</p>
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/booking?slot=${slot.id}`}>Réserver</Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

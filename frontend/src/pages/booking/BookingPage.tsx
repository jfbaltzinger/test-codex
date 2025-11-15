import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBookingSlots, useBookSlot } from '@/hooks/useBookings';
import { useCourses } from '@/hooks/useCourses';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '@/components/ui/Modal';

export const BookingPage = () => {
  const { data: slots, isLoading, isError } = useBookingSlots();
  const { data: courses } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(searchParams.get('slot'));
  const [search, setSearch] = useState('');
  const bookSlotMutation = useBookSlot();

  const filteredSlots = useMemo(() => {
    if (!slots) return [];
    return slots.filter((slot) => {
      const query = search.toLowerCase();
      return (
        slot.courseName.toLowerCase().includes(query) ||
        slot.coachName.toLowerCase().includes(query) ||
        slot.location.toLowerCase().includes(query)
      );
    });
  }, [search, slots]);

  const selectedSlot = filteredSlots.find((slot) => slot.id === selectedSlotId) ??
    slots?.find((slot) => slot.id === selectedSlotId) ??
    null;

  const handleBook = async () => {
    if (!selectedSlot) return;
    try {
      await bookSlotMutation.mutateAsync(selectedSlot.id);
      setSelectedSlotId(null);
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        next.delete('slot');
        return next;
      });
    } catch (error) {
      // handled by toast in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Réserver un créneau</h1>
          <p className="text-sm text-slate-500">Choisissez votre prochain cours et confirmez en un clic.</p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-96">
          <Input
            placeholder="Rechercher un cours, un coach ou un studio"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {courses && (
            <p className="text-xs text-slate-500">
              {courses.length} cours disponibles • Affinez votre recherche pour trouver le bon rythme.
            </p>
          )}
        </div>
      </div>

      {isLoading && <Card className="p-4 text-sm text-slate-400">Chargement des créneaux...</Card>}
      {isError && <Card className="p-4 text-sm text-red-500">Impossible de récupérer les créneaux.</Card>}

      {!isLoading && !isError && filteredSlots.length === 0 && (
        <Card className="p-4 text-sm text-slate-500">Aucun créneau ne correspond à votre recherche.</Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSlots.map((slot) => (
          <Card key={slot.id} className="flex flex-col space-y-3 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{slot.courseName}</p>
              <p className="text-xs uppercase text-primary-600">{slot.location}</p>
            </div>
            <div className="space-y-1 text-sm text-slate-500">
              <p>
                {format(parseISO(slot.start), "EEEE d MMMM", { locale: fr })} •
                {format(parseISO(slot.start), " HH'h'mm", { locale: fr })}
              </p>
              <p>Coach : {slot.coachName}</p>
              <p>{slot.availableSpots} places restantes</p>
            </div>
            <Button
              disabled={bookSlotMutation.isPending}
              onClick={() => {
                setSelectedSlotId(slot.id);
                setSearchParams((params) => {
                  const next = new URLSearchParams(params);
                  next.set('slot', slot.id);
                  return next;
                });
              }}
            >
              Réserver ce créneau
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedSlot)}
        onClose={() => {
          setSelectedSlotId(null);
          setSearchParams((params) => {
            const next = new URLSearchParams(params);
            next.delete('slot');
            return next;
          });
        }}
        title="Confirmer la réservation"
        description="Vérifiez les informations du cours avant de confirmer."
        confirmLabel="Confirmer"
        onConfirm={handleBook}
        confirmLoading={bookSlotMutation.isPending}
      >
        {selectedSlot && (
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{selectedSlot.courseName}</p>
            <p>
              {format(parseISO(selectedSlot.start), "EEEE d MMMM", { locale: fr })} de
              {format(parseISO(selectedSlot.start), " HH'h'mm", { locale: fr })} à
              {format(parseISO(selectedSlot.end), " HH'h'mm", { locale: fr })}
            </p>
            <p>Coach : {selectedSlot.coachName}</p>
            <p>Studio : {selectedSlot.location}</p>
            <p>Places restantes : {selectedSlot.availableSpots}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

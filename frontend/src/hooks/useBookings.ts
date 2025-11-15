import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookingHistoryItem,
  BookingSlot,
  BookingSummary,
  bookSlot,
  cancelBooking,
  getBookingHistory,
  getBookingSlots,
  getUpcomingBookings,
} from '@/api/bookings';
import { useToast } from '@/hooks/useToast';

export const useUpcomingBookings = () =>
  useQuery<BookingSummary[]>({
    queryKey: ['bookings', 'upcoming'],
    queryFn: getUpcomingBookings,
  });

export const useBookingSlots = () =>
  useQuery<BookingSlot[]>({
    queryKey: ['bookings', 'slots'],
    queryFn: getBookingSlots,
  });

export const useBookSlot = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (slotId: string) => bookSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'upcoming'] });
      toast.success('Réservation confirmée ✅');
    },
    onError: () => {
      toast.error("Impossible de réserver ce créneau. Merci de réessayer.");
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'upcoming'] });
      toast.info('Réservation annulée.');
    },
    onError: () => {
      toast.error("La réservation n'a pas pu être annulée.");
    },
  });
};

export const useBookingHistory = () =>
  useQuery<BookingHistoryItem[]>({
    queryKey: ['bookings', 'history'],
    queryFn: getBookingHistory,
  });

import api from './client';

export interface BookingSlot {
  id: string;
  courseId: string;
  courseName: string;
  coachName: string;
  start: string;
  end: string;
  availableSpots: number;
  location: string;
}

export interface BookingSummary {
  id: string;
  courseName: string;
  start: string;
  end: string;
  status: 'confirmed' | 'waiting' | 'cancelled';
}

export const getUpcomingBookings = async (): Promise<BookingSummary[]> => {
  const { data } = await api.get<BookingSummary[]>('/bookings/upcoming');
  return data;
};

export const getBookingSlots = async (): Promise<BookingSlot[]> => {
  const { data } = await api.get<BookingSlot[]>('/bookings/slots');
  return data;
};

export const bookSlot = async (slotId: string): Promise<void> => {
  await api.post(`/bookings/${slotId}/reserve`);
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  await api.post(`/bookings/${bookingId}/cancel`);
};

export interface BookingHistoryItem extends BookingSummary {
  coachName: string;
  location: string;
  creditsUsed: number;
}

export const getBookingHistory = async (): Promise<BookingHistoryItem[]> => {
  const { data } = await api.get<BookingHistoryItem[]>('/bookings/history');
  return data;
};

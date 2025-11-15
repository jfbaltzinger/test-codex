import { reservationsStore, sessionsStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

export class ReservationsService {
  async listReservations(userId: string) {
    return reservationsStore.findByUserId(userId);
  }

  async createReservation(userId: string, sessionId: string) {
    const session = sessionsStore.findById(sessionId);
    if (!session) {
      throw new HttpError(404, 'Session not found');
    }
    const reservation = reservationsStore.create({
      id: `res_${Date.now()}`,
      userId,
      sessionId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    });
    return reservation;
  }

  async cancelReservation(userId: string, reservationId: string) {
    const reservation = reservationsStore.findById(reservationId);
    if (!reservation || reservation.userId !== userId) {
      throw new HttpError(404, 'Reservation not found');
    }
    reservationsStore.update(reservationId, { status: 'cancelled' });
  }
}

import {
  reservationsStore,
  sessionsStore,
  transactionsStore,
  usersStore
} from '../utils/stores';
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
    const user = usersStore.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    if (user.credits <= 0) {
      throw new HttpError(402, 'Insufficient credits');
    }
    usersStore.update(userId, { credits: user.credits - 1 });
    const timestamp = new Date().toISOString();
    const reservation = reservationsStore.create({
      id: `res_${Date.now()}`,
      userId,
      sessionId,
      status: 'confirmed',
      createdAt: timestamp
    });
    transactionsStore.create({
      id: `txn_${Date.now()}`,
      userId,
      sessionId,
      credits: -1,
      type: 'consumption',
      createdAt: timestamp
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

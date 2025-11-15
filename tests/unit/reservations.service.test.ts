import { ReservationsService } from '../../src/services/reservations.service';
import { sessionsStore, reservationsStore } from '../../src/utils/stores';
import { HttpError } from '../../src/utils/http-error';

const service = new ReservationsService();

describe('ReservationsService', () => {
  it('creates and cancels a reservation for a known session', async () => {
    sessionsStore.create({
      id: 'session-1',
      title: 'Yoga Matinal',
      startsAt: new Date().toISOString(),
      durationMinutes: 60,
      instructor: 'Clara'
    });

    const reservation = await service.createReservation('user-1', 'session-1');

    expect(reservation).toMatchObject({
      userId: 'user-1',
      sessionId: 'session-1',
      status: 'confirmed'
    });

    await service.cancelReservation('user-1', reservation.id);

    const stored = reservationsStore.findById(reservation.id);
    expect(stored?.status).toBe('cancelled');
  });

  it('throws when attempting to reserve an unknown session', async () => {
    await expect(service.createReservation('user-1', 'missing-session')).rejects.toBeInstanceOf(HttpError);
  });
});

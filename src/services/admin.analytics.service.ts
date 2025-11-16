import { paymentsStore, reservationsStore, sessionsStore, usersStore } from '../utils/stores';

type DashboardMetrics = {
  totalBookings: number;
  revenue: number;
  creditsSold: number;
  occupancyRate: number;
  activeMembers: number;
  upcomingSessions: number;
};

type OccupancySnapshot = {
  id: string;
  courseName: string;
  sessionDate: string;
  bookedSpots: number;
  capacity: number;
};

export class AdminAnalyticsService {
  getDashboardMetrics(): DashboardMetrics {
    const bookings = reservationsStore.list();
    const sessions = sessionsStore.list();
    const members = usersStore.list().filter(user => user.role === 'member');

    const revenue = paymentsStore
      .list()
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);

    const creditsSold = paymentsStore
      .list()
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + (payment.amount > 0 ? payment.amount : 0), 0);

    const occupancyStats = this.computeOccupancy();

    return {
      totalBookings: bookings.length,
      revenue,
      creditsSold,
      occupancyRate: occupancyStats.averageOccupancy,
      activeMembers: members.length,
      upcomingSessions: sessions.filter(session => new Date(session.startsAt) > new Date()).length
    };
  }

  getOccupancySnapshots(): OccupancySnapshot[] {
    return this.computeOccupancy().snapshots;
  }

  private computeOccupancy(): { averageOccupancy: number; snapshots: OccupancySnapshot[] } {
    const sessions = sessionsStore.list();
    const reservations = reservationsStore.list();

    const snapshotsWithRate = sessions.map(
      (session): (OccupancySnapshot & { occupancy: number }) => {
        const booked = reservations.filter(reservation => reservation.sessionId === session.id).length;
        const capacity = session.capacity ?? 10;
        const occupancy = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;

        return {
          id: session.id,
          courseName: session.title,
          sessionDate: session.startsAt,
          bookedSpots: booked,
          capacity,
          occupancy
      };
    });

    if (snapshotsWithRate.length === 0) {
      return { averageOccupancy: 0, snapshots: [] };
    }

    const averageOccupancy = Math.round(
      snapshotsWithRate.reduce((sum, snapshot) => sum + snapshot.occupancy, 0) / snapshotsWithRate.length
    );

    return {
      averageOccupancy,
      snapshots: snapshotsWithRate.map(({ occupancy: _occupancy, ...snapshot }) => snapshot)
    };
  }
}


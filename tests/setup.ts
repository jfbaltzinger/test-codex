import { usersStore, packsStore, sessionsStore, reservationsStore, transactionsStore, paymentsStore } from '../src/utils/stores';

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'test-refresh-secret';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:4173';

const resetStore = (store: { data: unknown[] }) => {
  store.data.splice(0, store.data.length);
};

beforeEach(() => {
  resetStore(usersStore as unknown as { data: unknown[] });
  resetStore(packsStore as unknown as { data: unknown[] });
  resetStore(sessionsStore as unknown as { data: unknown[] });
  resetStore(reservationsStore as unknown as { data: unknown[] });
  resetStore(transactionsStore as unknown as { data: unknown[] });
  resetStore(paymentsStore as unknown as { data: unknown[] });
});

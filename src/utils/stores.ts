import { AdminPackInput } from '../models/admin.pack.model';
import { AdminSessionInput } from '../models/admin.session.model';
import { Reservation } from '../models/reservation.model';

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  credits: number;
};

type TransactionRecord = {
  id: string;
  userId: string;
  packId: string;
  credits: number;
  type: 'purchase';
  createdAt: string;
};

type PaymentRecord = {
  id: string;
  userId: string;
  packId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
};

type Store<T extends { id: string }> = {
  data: T[];
  findById(id: string): T | undefined;
  list(): T[];
  create(item: T): T;
  update(id: string, update: Partial<T>): T;
  delete(id: string): boolean;
};

const createStore = <T extends { id: string }>(seed: T[] = []): Store<T> => {
  const store: Store<T> = {
    data: seed,
    findById(id) {
      return this.data.find(item => item.id === id);
    },
    list() {
      return [...this.data];
    },
    create(item) {
      this.data.push(item);
      return item;
    },
    update(id, update) {
      const idx = this.data.findIndex(item => item.id === id);
      if (idx === -1) {
        throw new Error('Item not found');
      }
      this.data[idx] = { ...this.data[idx], ...update };
      return this.data[idx];
    },
    delete(id) {
      const idx = this.data.findIndex(item => item.id === id);
      if (idx === -1) {
        return false;
      }
      this.data.splice(idx, 1);
      return true;
    }
  };
  return store;
};

const users = createStore<UserRecord>([]);
const packs = createStore<AdminPackInput>([]);
const sessions = createStore<AdminSessionInput>([]);
const reservations = createStore<Reservation>([]);
const transactions = createStore<TransactionRecord>([]);
const payments = createStore<PaymentRecord>([]);

export const usersStore = {
  ...users,
  findByEmail(email: string) {
    return users.data.find(user => user.email === email);
  },
  create(user: UserRecord) {
    if (!user.id) {
      throw new Error('User id required');
    }
    return users.create(user);
  }
};

export const packsStore = packs;
export const sessionsStore = sessions;
export const reservationsStore = {
  ...reservations,
  findByUserId(userId: string) {
    return reservations.data.filter(res => res.userId === userId);
  }
};

export const transactionsStore = {
  ...transactions,
  findByUserId(userId: string) {
    return transactions.data.filter(txn => txn.userId === userId);
  }
};

export const paymentsStore = {
  ...payments,
  findByUserId(userId: string) {
    return payments.data.filter(payment => payment.userId === userId);
  }
};

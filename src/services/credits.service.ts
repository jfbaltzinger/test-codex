import { creditSchemas } from '../models/credit.model';
import { usersStore, transactionsStore, packsStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';

export class CreditsService {
  async getBalance(userId: string) {
    const user = usersStore.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return user.credits;
  }

  async purchasePack(userId: string, packId: string) {
    const data = creditSchemas.purchase.parse({ packId });
    const user = usersStore.findById(userId);
    const pack = packsStore.findById(data.packId);
    if (!user || !pack) {
      throw new HttpError(404, 'Resource not found');
    }
    user.credits += pack.credits;
    const transaction = transactionsStore.create({
      id: `txn_${Date.now()}`,
      userId,
      packId: pack.id,
      credits: pack.credits,
      type: 'purchase',
      createdAt: new Date().toISOString()
    });
    return { balance: user.credits, transaction };
  }

  async listTransactions(userId: string) {
    return transactionsStore.findByUserId(userId);
  }
}

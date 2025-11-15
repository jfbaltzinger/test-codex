import { CreditsService } from '../../src/services/credits.service';
import { usersStore, packsStore, transactionsStore } from '../../src/utils/stores';

const service = new CreditsService();

describe('CreditsService', () => {
  it('increments the user balance and records a transaction when purchasing a pack', async () => {
    usersStore.create({
      id: 'user-1',
      email: 'member@example.com',
      passwordHash: 'hash',
      role: 'member',
      credits: 2,
      tokenVersion: 0,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });

    packsStore.create({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Pack Découverte',
      credits: 5,
      price: 49
    });

    const result = await service.purchasePack('user-1', '11111111-1111-1111-1111-111111111111');

    expect(result.balance).toBe(7);
    expect(transactionsStore.list()).toHaveLength(1);
    expect(transactionsStore.list()[0]).toMatchObject({
      userId: 'user-1',
      credits: 5,
      type: 'purchase'
    });
  });
});

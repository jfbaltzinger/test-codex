import { AdminUsersService } from '../../src/services/admin.users.service';
import { usersStore } from '../../src/utils/stores';
import { HttpError } from '../../src/utils/http-error';

const service = new AdminUsersService();

describe('AdminUsersService', () => {
  it('creates admin accounts with hashed passwords and hides sensitive data when listing', async () => {
    const created = await service.createUser({
      id: '22222222-2222-2222-2222-222222222222',
      email: 'admin@example.com',
      password: 'AdminSecret1!',
      role: 'admin',
      credits: 10
    });

    expect(created).toMatchObject({
      id: '22222222-2222-2222-2222-222222222222',
      email: 'admin@example.com',
      role: 'admin',
      credits: 10
    });
    expect(created).not.toHaveProperty('passwordHash');

    const [listed] = await service.listUsers();
    expect(listed).toMatchObject({ email: 'admin@example.com', role: 'admin' });
    expect(listed).not.toHaveProperty('passwordHash');

    const stored = usersStore.findByEmail('admin@example.com');
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toBe('AdminSecret1!');
  });

  it('throws when updating an unknown user', async () => {
    await expect(
      service.updateUser('33333333-3333-3333-3333-333333333333', { email: 'missing@example.com' })
    ).rejects.toBeInstanceOf(HttpError);
  });
});

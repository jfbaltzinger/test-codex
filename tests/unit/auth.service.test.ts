import { AuthService } from '../../src/services/auth.service';
import { usersStore } from '../../src/utils/stores';
import { tokenService } from '../../src/utils/token.service';
import { HttpError } from '../../src/utils/http-error';

const authService = new AuthService();

describe('AuthService', () => {
  it('registers a new member and returns a sanitized profile', async () => {
    const user = await authService.register({
      email: 'new.user@example.com',
      password: 'SuperSecret1!',
      role: 'member'
    });

    expect(user).toMatchObject({
      email: 'new.user@example.com',
      role: 'member',
      credits: 0
    });
    expect(user).not.toHaveProperty('passwordHash');
    expect(usersStore.list()).toHaveLength(1);
  });

  it('allows a registered user to login and issues valid JWT tokens', async () => {
    await authService.register({
      email: 'login.user@example.com',
      password: 'AnotherSecret1!',
      role: 'member'
    });

    const { user, tokens } = await authService.login({
      email: 'login.user@example.com',
      password: 'AnotherSecret1!'
    });

    expect(user.email).toBe('login.user@example.com');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    const payload = tokenService.verifyAccessToken(tokens.accessToken);
    expect(payload.userId).toBe(user.id);
    expect(payload.role).toBe('member');
  });

  it('rejects invalid credentials', async () => {
    await expect(
      authService.login({ email: 'ghost@example.com', password: 'DoesNotExist1!' })
    ).rejects.toBeInstanceOf(HttpError);
  });
});

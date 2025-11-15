import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { authSchemas, LoginInput, RegisterInput, RequestPasswordResetInput, ResetPasswordInput } from '../models/auth.model';
import { tokenService } from '../utils/token.service';
import { UserRecord, usersStore } from '../utils/stores';
import { HttpError } from '../utils/http-error';
import { EmailService } from './email.service';

const emailService = new EmailService();

type SafeUser = Omit<UserRecord, 'passwordHash' | 'passwordResetTokenHash' | 'passwordResetExpiresAt' | 'tokenVersion'>;

const sanitizeUser = (user: UserRecord): SafeUser => {
  const { passwordHash, passwordResetExpiresAt, passwordResetTokenHash, ...safe } = user;
  return safe;
};

export class AuthService {
  async register(payload: RegisterInput) {
    const data = authSchemas.register.parse(payload);
    const existing = usersStore.findByEmail(data.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = usersStore.create({
      id: uuid(),
      email: data.email,
      passwordHash: hashed,
      role: data.role ?? 'member',
      credits: 0,
      tokenVersion: 0,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });

    return sanitizeUser(user);
  }

  async login(payload: LoginInput) {
    const { email, password } = authSchemas.login.parse(payload);
    const user = usersStore.findByEmail(email);
    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const updated = usersStore.update(user.id, {
      tokenVersion: user.tokenVersion + 1,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });

    const tokens = tokenService.generateAuthTokens(updated);
    return { tokens, user: sanitizeUser(updated) };
  }

  async refreshToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new HttpError(401, 'Refresh token missing');
    }
    const { userId, tokenVersion } = tokenService.verifyRefreshToken(refreshToken);
    const user = usersStore.findById(userId);
    if (!user || user.tokenVersion !== tokenVersion) {
      throw new HttpError(401, 'Invalid token');
    }

    const updated = usersStore.update(user.id, { tokenVersion: user.tokenVersion + 1 });
    const tokens = tokenService.generateAuthTokens(updated);
    return { tokens, user: sanitizeUser(updated) };
  }

  async getProfile(userId: string) {
    const user = usersStore.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return sanitizeUser(user);
  }

  async logout(userId: string) {
    const user = usersStore.findById(userId);
    if (!user) {
      return;
    }
    usersStore.update(user.id, { tokenVersion: user.tokenVersion + 1 });
  }

  async requestPasswordReset(payload: RequestPasswordResetInput) {
    const data = authSchemas.requestPasswordReset.parse(payload);
    const user = usersStore.findByEmail(data.email);

    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    const updated = usersStore.update(user.id, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt
    });

    const url = new URL(data.redirectUrl);
    url.searchParams.set('token', rawToken);

    await emailService.sendPasswordResetEmail(updated.email, {
      resetLink: url.toString()
    });
  }

  async resetPassword(payload: ResetPasswordInput) {
    const data = authSchemas.resetPassword.parse(payload);
    const hashedToken = crypto.createHash('sha256').update(data.token).digest('hex');
    const user = usersStore.findByResetToken(hashedToken);

    if (!user) {
      throw new HttpError(400, 'Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const updated = usersStore.update(user.id, {
      passwordHash,
      tokenVersion: user.tokenVersion + 1,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    });

    const tokens = tokenService.generateAuthTokens(updated);
    return { tokens, user: sanitizeUser(updated) };
  }
}

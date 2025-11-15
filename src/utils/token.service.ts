import jwt from 'jsonwebtoken';
import { HttpError } from './http-error';
import { UserRecord, UserRole } from './stores';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class TokenService {
  generateAuthTokens(user: UserRecord) {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('Token secrets are not configured');
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_TTL });
    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: REFRESH_TOKEN_TTL }
    );
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET missing');
      }
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string; role: UserRole };
    } catch (error) {
      throw new HttpError(401, 'Invalid token');
    }
  }

  verifyRefreshToken(token: string) {
    try {
      if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET missing');
      }
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { userId: string; tokenVersion: number };
    } catch (error) {
      throw new HttpError(401, 'Invalid token');
    }
  }
}

export const tokenService = new TokenService();

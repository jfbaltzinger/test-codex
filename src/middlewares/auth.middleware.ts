import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../utils/token.service';
import { HttpError } from '../utils/http-error';
import { UserRole } from '../utils/stores';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'));
  }
  try {
    const token = authHeader.substring(7);
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid token'));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, (err?: unknown) => {
      if (err) {
        return next(err);
      }
      if (!req.user || !roles.includes(req.user.role)) {
        return next(new HttpError(403, 'Insufficient permissions'));
      }
      next();
    });
  };
};

export const requireAdmin = authorize('admin');

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';
import { REFRESH_TOKEN_TTL_MS } from '../utils/token.service';

export class AuthController {
  private readonly service = new AuthService();

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: '/api/auth/refresh'
    });
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.register(req.body);
    res.status(201).json(user);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { tokens, user } = await this.service.login(req.body);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.status(200).json({ accessToken: tokens.accessToken, user });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { tokens, user } = await this.service.refreshToken(req.cookies?.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.status(200).json({ accessToken: tokens.accessToken, user });
  });

  profile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await this.service.getProfile(req.user!.id);
    res.status(200).json(profile);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await this.service.updateProfile(req.user!.id, req.body);
    res.status(200).json(profile);
  });

  updatePassword = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updatePassword(req.user!.id, req.body);
    res.status(204).send();
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await this.service.logout(req.user!.id);
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.status(204).send();
  });

  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    await this.service.requestPasswordReset(req.body);
    res.status(204).send();
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { tokens, user } = await this.service.resetPassword(req.body);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.status(200).json({ accessToken: tokens.accessToken, user });
  });
}

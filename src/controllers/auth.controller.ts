import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';

export class AuthController {
  private readonly service = new AuthService();

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.register(req.body);
    res.status(201).json(user);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await this.service.login(req.body.email, req.body.password);
    res.status(200).json(tokens);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await this.service.refreshToken(req.body.refreshToken);
    res.status(200).json(tokens);
  });
}

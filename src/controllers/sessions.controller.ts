import { Request, Response } from 'express';
import { SessionsService } from '../services/sessions.service';
import { asyncHandler } from '../utils/async-handler';

export class SessionsController {
  private readonly service = new SessionsService();

  listSessions = asyncHandler(async (_req: Request, res: Response) => {
    const sessions = await this.service.listSessions();
    res.json(sessions);
  });

  getSessionById = asyncHandler(async (req: Request, res: Response) => {
    const session = await this.service.getSessionById(req.params.id);
    res.json(session);
  });
}

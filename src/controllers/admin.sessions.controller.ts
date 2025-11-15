import { Request, Response } from 'express';
import { AdminSessionsService } from '../services/admin.sessions.service';
import { asyncHandler } from '../utils/async-handler';

export class AdminSessionsController {
  private readonly service = new AdminSessionsService();

  listSessions = asyncHandler(async (_req: Request, res: Response) => {
    const sessions = await this.service.listSessions();
    res.json(sessions);
  });

  createSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await this.service.createSession(req.body);
    res.status(201).json(session);
  });

  updateSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await this.service.updateSession(req.params.id, req.body);
    res.json(session);
  });

  deleteSession = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteSession(req.params.id);
    res.status(204).send();
  });
}

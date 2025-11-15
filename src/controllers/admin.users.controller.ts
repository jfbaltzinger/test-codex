import { Request, Response } from 'express';
import { AdminUsersService } from '../services/admin.users.service';
import { asyncHandler } from '../utils/async-handler';

export class AdminUsersController {
  private readonly service = new AdminUsersService();

  listUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.service.listUsers();
    res.json(users);
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.createUser(req.body);
    res.status(201).json(user);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.updateUser(req.params.id, req.body);
    res.json(user);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteUser(req.params.id);
    res.status(204).send();
  });
}

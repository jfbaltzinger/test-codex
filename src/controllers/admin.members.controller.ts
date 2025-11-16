import { Request, Response } from 'express';
import { AdminMembersService } from '../services/admin.members.service';
import { asyncHandler } from '../utils/async-handler';

export class AdminMembersController {
  private readonly service = new AdminMembersService();

  listMembers = asyncHandler(async (_req: Request, res: Response) => {
    const members = await this.service.listMembers();
    res.json(members);
  });

  createMember = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.service.createMember(req.body);
    res.status(201).json(member);
  });

  updateMember = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.service.updateMember(req.params.id, req.body);
    res.json(member);
  });

  deleteMember = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteMember(req.params.id);
    res.status(204).send();
  });
}

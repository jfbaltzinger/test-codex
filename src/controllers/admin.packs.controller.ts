import { Request, Response } from 'express';
import { AdminPacksService } from '../services/admin.packs.service';
import { asyncHandler } from '../utils/async-handler';

export class AdminPacksController {
  private readonly service = new AdminPacksService();

  listPacks = asyncHandler(async (_req: Request, res: Response) => {
    const packs = await this.service.listPacks();
    res.json(packs);
  });

  createPack = asyncHandler(async (req: Request, res: Response) => {
    const pack = await this.service.createPack(req.body);
    res.status(201).json(pack);
  });

  updatePack = asyncHandler(async (req: Request, res: Response) => {
    const pack = await this.service.updatePack(req.params.id, req.body);
    res.json(pack);
  });

  deletePack = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deletePack(req.params.id);
    res.status(204).send();
  });
}

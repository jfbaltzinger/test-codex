import { Request, Response } from 'express';
import { CreditsService } from '../services/credits.service';
import { asyncHandler } from '../utils/async-handler';

export class CreditsController {
  private readonly service = new CreditsService();

  getBalance = asyncHandler(async (req: Request, res: Response) => {
    const balance = await this.service.getBalance(req.user!.id);
    res.json({ balance });
  });

  purchasePack = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.purchasePack(req.user!.id, req.body.packId);
    res.json(result);
  });

  listTransactions = asyncHandler(async (req: Request, res: Response) => {
    const transactions = await this.service.listTransactions(req.user!.id);
    res.json(transactions);
  });
}

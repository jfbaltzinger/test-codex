import { Request, Response } from 'express';
import { AdminAnalyticsService } from '../services/admin.analytics.service';
import { asyncHandler } from '../utils/async-handler';

export class AdminAnalyticsController {
  private readonly service = new AdminAnalyticsService();

  getDashboard = asyncHandler(async (_req: Request, res: Response) => {
    const metrics = this.service.getDashboardMetrics();
    res.json(metrics);
  });

  getOccupancy = asyncHandler(async (_req: Request, res: Response) => {
    const snapshots = this.service.getOccupancySnapshots();
    res.json(snapshots);
  });
}


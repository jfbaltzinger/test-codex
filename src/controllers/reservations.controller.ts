import { Request, Response } from 'express';
import { ReservationsService } from '../services/reservations.service';
import { asyncHandler } from '../utils/async-handler';

export class ReservationsController {
  private readonly service = new ReservationsService();

  listReservations = asyncHandler(async (req: Request, res: Response) => {
    const reservations = await this.service.listReservations(req.user!.id);
    res.json(reservations);
  });

  createReservation = asyncHandler(async (req: Request, res: Response) => {
    const reservation = await this.service.createReservation(req.user!.id, req.body.sessionId);
    res.status(201).json(reservation);
  });

  cancelReservation = asyncHandler(async (req: Request, res: Response) => {
    await this.service.cancelReservation(req.user!.id, req.params.id);
    res.status(204).send();
  });
}

import { Router } from 'express';
import { ReservationsController } from '../controllers/reservations.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { reservationSchemas } from '../models/reservation.model';

const router = Router();
const controller = new ReservationsController();

router.get('/', requireAuth, controller.listReservations);
router.post('/', requireAuth, validateRequest(reservationSchemas.create), controller.createReservation);
router.delete('/:id', requireAuth, validateRequest(reservationSchemas.cancel), controller.cancelReservation);

export default router;

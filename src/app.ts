import express, { Request } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.routes';
import creditsRouter from './routes/credits.routes';
import sessionsRouter from './routes/sessions.routes';
import reservationsRouter from './routes/reservations.routes';
import adminUsersRouter from './routes/admin.users.routes';
import adminPacksRouter from './routes/admin.packs.routes';
import adminSessionsRouter from './routes/admin.sessions.routes';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import paymentsRouter from './routes/payments.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(compression());
app.use(
  express.json({
    verify: (req: Request, _res, buf) => {
      if (req.originalUrl.startsWith('/api/payments/webhook')) {
        (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
      }
    }
  })
);
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/packs', adminPacksRouter);
app.use('/api/admin/sessions', adminSessionsRouter);
app.use('/api/payments', paymentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

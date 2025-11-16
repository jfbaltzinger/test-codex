import express, { Request } from 'express';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.routes';
import creditsRouter from './routes/credits.routes';
import sessionsRouter from './routes/sessions.routes';
import reservationsRouter from './routes/reservations.routes';
import adminUsersRouter from './routes/admin.users.routes';
import adminMembersRouter from './routes/admin.members.routes';
import adminPacksRouter from './routes/admin.packs.routes';
import adminSessionsRouter from './routes/admin.sessions.routes';
import adminAnalyticsRouter from './routes/admin.analytics.routes';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import paymentsRouter from './routes/payments.routes';
import { seedDemoData } from './utils/demo-data';

const app = express();

void seedDemoData();

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(helmet());
app.use(
  cors(corsOptions)
);
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
app.use('/api/admin/members', adminMembersRouter);
app.use('/api/admin/packs', adminPacksRouter);
app.use('/api/admin/credit-packs', adminPacksRouter);
app.use('/api/admin/sessions', adminSessionsRouter);
app.use('/api/admin', adminAnalyticsRouter);
app.use('/api/payments', paymentsRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

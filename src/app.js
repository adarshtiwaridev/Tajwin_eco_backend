import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import v1Routes from './routes/v1/index.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running normally.' });
});

// v1 API routes
app.use('/api/v1', v1Routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

import { Router } from 'express';
import * as DashboardController from './controller.js';
import { authenticate } from '#middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', DashboardController.getDashboard);

export default router;

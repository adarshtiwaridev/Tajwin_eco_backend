import { Router } from 'express';
import authRoutes from '#modules/auth/route.js';
import adminRoutes from '#modules/admin/route.js';
import rolesRoutes from '#modules/roles/route.js';
import delshipRoutes from '#modules/delship/route.js';
import dashboardRoutes from '#modules/dashboard/route.js';
import retailerRoutes from '#modules/retailer/route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/roles', rolesRoutes);
router.use('/dealerships', delshipRoutes);
router.use('/retailers', retailerRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;

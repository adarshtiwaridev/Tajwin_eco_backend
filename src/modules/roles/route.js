import { Router } from 'express';
import * as RoleController from './controller.js';
import { authenticate } from '#middlewares/authMiddleware.js';
import { authorize } from '#middlewares/permissionMiddleware.js';

const router = Router();

// Only ADMIN can manage roles
router.use(authenticate, authorize('ADMIN'));

router.post('/', RoleController.createRole);
router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRoleById);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

export default router;

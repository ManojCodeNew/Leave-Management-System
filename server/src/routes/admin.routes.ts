import { Router } from 'express';
import {
  getDashboardStats,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getAllEmployees,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Enforce admin authentication on all admin routes
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/leaves', getAllLeaves);
router.post('/leaves/:id/approve', approveLeave);
router.put('/leaves/:id/approve', approveLeave);
router.post('/leaves/:id/reject', rejectLeave);
router.put('/leaves/:id/reject', rejectLeave);
router.get('/employees', getAllEmployees);

export default router;


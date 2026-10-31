import { Router } from 'express';
import {
  createLeave,
  getMyLeaves,
  getLeaveById,
  getMyBalance,
} from '../controllers/leave.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, createLeave);
router.get('/', authenticate, getMyLeaves);
router.get('/balance', authenticate, getMyBalance);
router.get('/:id', authenticate, getLeaveById);

export default router;


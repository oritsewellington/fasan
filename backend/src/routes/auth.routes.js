import { Router } from 'express';
import { login, getMe, getOrganizers, createOrganizer, updateCommission } from '../controllers/auth.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/organizers', protect, requireAdmin, getOrganizers);
router.post('/organizers', protect, requireAdmin, createOrganizer);
router.patch('/organizers/:id/commission', protect, requireAdmin, updateCommission);

export default router;

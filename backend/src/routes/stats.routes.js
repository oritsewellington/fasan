import { Router } from 'express';
import { getAdminStats, getOrganizerStats, getEventStats, getRecentTransactions } from '../controllers/stats.controller.js';
import { protect, requireAdmin, requireOrganizer } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/admin',                  protect, requireAdmin,     getAdminStats);
router.get('/organizer/:organizerId', protect, requireOrganizer, getOrganizerStats);
router.get('/event/:eventId',         protect, requireOrganizer, getEventStats);
router.get('/transactions',           protect, requireOrganizer, getRecentTransactions);

export default router;

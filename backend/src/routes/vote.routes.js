import { Router } from 'express';
import { initializePayment, verifyPayment, getVotes } from '../controllers/vote.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/initialize',        initializePayment);
router.post('/verify/:reference', verifyPayment);
router.get('/',                   protect, requireAdmin, getVotes);

export default router;

import { Router } from "express";
import {
  getAdminStats,
  getStaffStats,
  getEventStats,
  getRecentTransactions,
  getPlatformStats,
} from "../controllers/stats.controller.js";
import {
  protect,
  requireAdmin,
  requireStaff,
} from "../middleware/auth.middleware.js";

const router = Router();
router.get("/platform", getPlatformStats);
router.get("/admin", protect, requireAdmin, getAdminStats);
router.get("/staff", protect, requireStaff, getStaffStats);
router.get("/event/:eventId", protect, requireStaff, getEventStats);
router.get("/transactions", protect, requireStaff, getRecentTransactions);

export default router;

import { Router } from "express";
import {
  login,
  getMe,
  getStaff,
  createStaff,
  deleteStaff,
} from "../controllers/auth.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/login", login);
router.get("/me", protect, getMe);

// Admin only — seed/revoke staff logins
router.get("/staff", protect, requireAdmin, getStaff);
router.post("/staff", protect, requireAdmin, createStaff);
router.delete("/staff/:id", protect, requireAdmin, deleteStaff);

export default router;

import { Router } from "express";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEvent,
} from "../controllers/event.controller.js";
import { protect, requireStaff } from "../middleware/auth.middleware.js";
import { uploadBanner } from "../middleware/upload.middleware.js";

const router = Router();
router.get("/", getEvents);
router.get("/:id", getEvent);
router.post(
  "/",
  protect,
  requireStaff,
  uploadBanner.single("banner"),
  createEvent,
);
router.put(
  "/:id",
  protect,
  requireStaff,
  uploadBanner.single("banner"),
  updateEvent,
);
router.delete("/:id", protect, requireStaff, deleteEvent);
router.patch("/:id/toggle", protect, requireStaff, toggleEvent);

export default router;

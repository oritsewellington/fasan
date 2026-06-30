import { Router } from "express";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEvent,
} from "../controllers/event.controller.js";
import { protect, requireOrganizer } from "../middleware/auth.middleware.js";
import { uploadBanner } from "../middleware/upload.middleware.js";

const router = Router();
router.get("/", getEvents);
router.get("/:id", getEvent);
router.post(
  "/",
  protect,
  requireOrganizer,
  uploadBanner.single("banner"),
  createEvent,
);
router.put(
  "/:id",
  protect,
  requireOrganizer,
  uploadBanner.single("banner"),
  updateEvent,
);
router.delete("/:id", protect, requireOrganizer, deleteEvent);
router.patch("/:id/toggle", protect, requireOrganizer, toggleEvent);

export default router;

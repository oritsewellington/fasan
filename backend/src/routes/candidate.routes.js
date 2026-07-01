import { Router } from "express";
import {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidate.controller.js";
import { protect, requireStaff } from "../middleware/auth.middleware.js";
import { uploadCandidate } from "../middleware/upload.middleware.js";

const router = Router({ mergeParams: true });

// Public - anyone can view candidates
router.get("/:eventId/candidates", getCandidates);
router.get("/:eventId/candidates/:candidateId", getCandidate);

// Any admin or staff — no ownership check
router.post(
  "/:eventId/candidates",
  protect,
  requireStaff,
  uploadCandidate.single("photo"),
  createCandidate,
);
router.put(
  "/:eventId/candidates/:candidateId",
  protect,
  requireStaff,
  uploadCandidate.single("photo"),
  updateCandidate,
);
router.delete(
  "/:eventId/candidates/:candidateId",
  protect,
  requireStaff,
  deleteCandidate,
);

export default router;

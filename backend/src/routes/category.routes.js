import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, requireOrganizer } from "../middleware/auth.middleware.js";

const router = Router();

// Public — anyone browsing the site can see categories
router.get("/", getCategories);
router.get("/:id", getCategory);

// Protected — admins and organizers can create/manage categories
router.post("/", protect, requireOrganizer, createCategory);
router.patch("/:id", protect, requireOrganizer, updateCategory);
router.delete("/:id", protect, requireOrganizer, deleteCategory);

export default router;

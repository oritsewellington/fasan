import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, requireStaff } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

router.post("/", protect, requireStaff, createCategory);
router.patch("/:id", protect, requireStaff, updateCategory);
router.delete("/:id", protect, requireStaff, deleteCategory);

export default router;

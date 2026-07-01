import { Router } from "express";
import { paystackWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// Public on purpose — Paystack's servers call this directly, no JWT.
// Trust comes from the HMAC signature check inside the controller, not
// from auth middleware.
router.post("/paystack", paystackWebhook);

export default router;

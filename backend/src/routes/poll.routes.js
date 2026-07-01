import { Router } from "express";
import { getEventPoll, getAllPolls } from "../controllers/poll.controller.js";

const router = Router();

// Public — anyone browsing the site can view live results
router.get("/", getAllPolls); // GET /api/polls
router.get("/:eventId", getEventPoll); // GET /api/polls/:eventId

export default router;

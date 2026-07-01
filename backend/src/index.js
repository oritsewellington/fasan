import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";
import { connectDB } from "./utils/db.js";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import candidateRoutes from "./routes/candidate.routes.js";
import voteRoutes from "./routes/vote.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import categoriesRoutes from "./routes/category.routes.js";
import pollRoutes from "./routes/poll.routes.js"; // NEW

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(
  "/api/votes",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { message: "Too many payment requests. Please slow down." },
  }),
);
// Polls get hit frequently (every ~20s per open leaderboard) — its own
// generous limit so it never competes with the payment rate limit above.
app.use("/api/polls", rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/polls", pollRoutes); // NEW
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE")
    return res
      .status(400)
      .json({ message: "File too large. Max 5MB allowed." });
  if (err.message?.includes("Only JPEG"))
    return res.status(400).json({ message: err.message });
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error." });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});

import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessons.js";
import recommendationRoutes from "./routes/recommendations.js";
import profileRoutes from "./routes/profile.js";
import progressRoutes from "./routes/progress.js";
import analyticsRoutes from "./routes/analytics.js";

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function createApp() {
  const app = express();

  app.locals.jwtSecret = JWT_SECRET;

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "adaptive-learning-api", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/lessons", lessonRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // Fallback error handler so unexpected failures return JSON, not HTML.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server" });
  });

  return app;
}

async function start() {
  await connectDatabase(process.env.MONGODB_URI);
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Adaptive Learning API listening on http://localhost:${PORT}`);
  });
}

// Only boot the server when run directly (keeps imports clean for tests).
if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  start().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
}

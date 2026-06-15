// ============================================================
// Novel Violet — Central Route Index
// ============================================================
// Gom tất cả route modules vào 1 file.
// Server.js chỉ cần import file này.
// ============================================================

const { Router } = require("express");
const storiesRoutes = require("./stories");
const authRoutes = require("./auth");
const adminRoutes = require("./admin");

const router = Router();

// ── Health Check ──
// Dùng để monitoring (Docker healthcheck, load balancer, uptime robot)
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Mount route modules ──
router.use("/stories", storiesRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

// GET /api/categories
router.get("/categories", async (req, res, next) => {
  try {
    const db = require("../config/db");
    const result = await db.query(`SELECT id, name, slug FROM categories ORDER BY name ASC`);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});
// router.use("/users", usersRoutes);
// router.use("/chapters", chaptersRoutes);

module.exports = router;


// ============================================================
// Novel Violet — Express Server Entry Point
// ============================================================
// Khởi tạo server Express với đầy đủ middleware:
// - CORS (cho phép frontend gọi API)
// - JSON body parser
// - Request logging
// - Routes
// - Error handling
// ============================================================

// Load biến môi trường từ .env TRƯỚC KHI import bất kỳ module nào
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const db = require("./config/db");

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// ────────────────────────────────────────────────────────────
// MIDDLEWARE
// ────────────────────────────────────────────────────────────

// ── CORS ──
// Cho phép frontend (mặc định localhost:3000) gọi API
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
      : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body Parser ──
// Giới hạn body 5MB để tránh abuse
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ── Request Logger (đơn giản) ──
// Production nên dùng morgan hoặc pino
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────

// Mount tất cả API routes dưới prefix /api
app.use("/api", routes);

// ────────────────────────────────────────────────────────────
// ERROR HANDLING
// ────────────────────────────────────────────────────────────

// 404: Không tìm thấy route
app.use(notFoundHandler);

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler);

// ────────────────────────────────────────────────────────────
// START SERVER
// ────────────────────────────────────────────────────────────

async function start() {
  try {
    // ★ Test kết nối database trước khi khởi động server
    // Chạy SELECT NOW() để xác nhận PostgreSQL sẵn sàng
    const serverTime = await db.testConnection();
    console.log(`[DB] ✓ Connected to "${process.env.DB_NAME || "Violet_db"}" successfully`);
    console.log(`[DB]   Server time: ${serverTime}`);

    // Dynamic schema migration: add scheduled_at column to chapters table if it doesn't exist
    await db.query(`ALTER TABLE chapters ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;`);
    console.log(`[DB] ✓ Database migration completed: chapters.scheduled_at verified/added.`);

    // Dynamic schema migration: create story_categories junction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS story_categories (
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (story_id, category_id)
      );
      CREATE INDEX IF NOT EXISTS idx_story_categories_story_id ON story_categories (story_id);
      CREATE INDEX IF NOT EXISTS idx_story_categories_category_id ON story_categories (category_id);
    `);
    
    // Copy existing relations if any
    await db.query(`
      INSERT INTO story_categories (story_id, category_id)
      SELECT id, category_id FROM stories WHERE category_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    `);
    console.log(`[DB] ✓ Database migration completed: story_categories table and index verified, data synced.`);

    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`  Novel Violet API Server`);
      console.log(`  Port:     ${PORT}`);
      console.log(`  Mode:     ${process.env.NODE_ENV || "development"}`);
      console.log(`  Database: ${process.env.DB_NAME || "Violet_db"}`);
      console.log(`  DB Host:  ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}`);
      console.log(`========================================\n`);
    });
  } catch (err) {
    console.error("[FATAL] Cannot connect to database:", err.message);
    console.error("");
    console.error("Hãy kiểm tra:");
    console.error("  1. PostgreSQL đang chạy");
    console.error(`  2. Database "${process.env.DB_NAME || "Violet_db"}" đã tồn tại`);
    console.error("  3. File .env có đúng thông tin kết nối (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)");
    console.error("  4. User PostgreSQL có quyền truy cập database này");
    process.exit(1);
  }
}

// Graceful shutdown — đóng connection pool khi process bị kill
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received. Shutting down gracefully...");
  await db.pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n[Server] SIGINT received. Shutting down gracefully...");
  await db.pool.end();
  process.exit(0);
});

start();

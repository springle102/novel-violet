// ============================================================
// Trạm Chữ Novel — Database Connection (Connection Pool)
// ============================================================
// Sử dụng pg.Pool để quản lý connection pool, giúp chịu tải
// read-heavy tốt hơn so với tạo connection mới cho mỗi request.
//
// ★ Tất cả thông tin kết nối được đọc từ biến môi trường (.env)
//   KHÔNG hardcode bất kỳ thông tin nhạy cảm nào trong code.
// ============================================================

const { Pool } = require("pg");

// ── Khởi tạo Connection Pool ──
// Pool tự động quản lý việc tạo/đóng/tái sử dụng connection.
// Mỗi request gọi pool.query() sẽ tự checkout 1 connection,
// chạy query, rồi trả connection về pool.
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME     || "Violet_db",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",

  // ── Pool Configuration ──
  // max: Số connection tối đa trong pool.
  // Giá trị quá lớn → tốn RAM trên PostgreSQL (mỗi connection ~ 5-10MB).
  // Giá trị quá nhỏ → request phải chờ connection rảnh.
  max: parseInt(process.env.DB_POOL_MAX || "20", 10),

  // idleTimeoutMillis: Thời gian (ms) connection idle trước khi bị đóng.
  // 30s là hợp lý — đủ nhanh để reuse, không giữ connection quá lâu.
  idleTimeoutMillis: 30000,

  // connectionTimeoutMillis: Timeout khi chờ lấy connection từ pool.
  // Nếu pool đầy và không có connection rảnh trong 5s → throw error.
  connectionTimeoutMillis: 5000,
});

// ── Event listeners cho monitoring ──
pool.on("connect", () => {
  console.log("[DB] New client connected to pool");
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client:", err.message);
  // Không process.exit() — pool sẽ tự reconnect
});

/**
 * Test kết nối database.
 * Gọi hàm này khi server khởi động để xác nhận DB sẵn sàng.
 * @returns {Promise<string>} Thời gian hiện tại từ DB server
 */
async function testConnection() {
  const result = await pool.query("SELECT NOW() AS server_time");
  return result.rows[0].server_time;
}

/**
 * Helper: Chạy 1 query đơn giản (auto checkout & release connection)
 * @param {string} text - SQL query string
 * @param {any[]} params - Query parameters (parameterized để chống SQL injection)
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  // Log slow queries (> 200ms) để debug performance
  if (duration > 200) {
    console.warn("[DB] Slow query:", { text, duration: `${duration}ms`, rows: result.rowCount });
  }

  return result;
}

/**
 * Helper: Lấy 1 client từ pool để chạy transaction
 * Nhớ gọi client.release() sau khi dùng xong!
 * @returns {Promise<import('pg').PoolClient>}
 */
async function getClient() {
  return pool.connect();
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};

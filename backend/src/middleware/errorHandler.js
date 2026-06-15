// ============================================================
// Novel Violet — Error Handler Middleware
// ============================================================
// Middleware xử lý lỗi tập trung. Đặt cuối cùng trong middleware chain.
// Express nhận ra đây là error handler nhờ 4 tham số (err, req, res, next).
// ============================================================

/**
 * Global error handler
 * - Development: trả về stack trace để debug
 * - Production: ẩn chi tiết lỗi, chỉ trả message chung
 */
function errorHandler(err, _req, res, _next) {
  console.error("[ERROR]", err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    error: isDev ? err.message : "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * 404 handler — khi không có route nào match
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} không tồn tại.`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

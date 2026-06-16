// ============================================================
// Trạm Chữ Novel — Admin Authentication Middleware
// ============================================================
// Xác thực JWT token và phân quyền truy cập admin panel.
// - verifyToken: Giải mã token, gắn user vào req
// - requireAdmin: Chỉ cho phép admin
// - verifyAdmin: Middleware chuyên dụng tự động check token + check role admin
// - requireAuthorOrAdmin: Cho phép admin hoặc author
// ============================================================

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';

// Verify JWT token and attach user to request
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token xác thực không hợp lệ hoặc thiếu.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token đã hết hạn hoặc không hợp lệ.' });
  }
}

// Only admin can access
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập. Chỉ dành cho Admin.' });
  }
  next();
}

// Dedicated verifyAdmin middleware (combines verification + admin role check)
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token xác thực không hợp lệ hoặc thiếu.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập. Chỉ dành cho Admin.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token đã hết hạn hoặc không hợp lệ.' });
  }
}

// Admin or Author can access
function requireAuthorOrAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'author') {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, verifyAdmin, requireAuthorOrAdmin };

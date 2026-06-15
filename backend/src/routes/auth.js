// ============================================================
// Novel Violet — Auth Routes
// ============================================================
// Định nghĩa các route cho xác thực người dùng.
// POST /api/auth/register — Đăng ký tài khoản mới
// POST /api/auth/login    — Đăng nhập
// ============================================================

const { Router } = require("express");
const authController = require("../controllers/authController");

const router = Router();

// POST /api/auth/register
// Body: { fullName, email, password, role }
router.post("/register", authController.register);

// POST /api/auth/login
// Body: { email, password, role }
router.post("/login", authController.login);

// PUT /api/auth/profile
// Body: { userId, username, avatarUrl }
router.put("/profile", authController.updateProfile);

module.exports = router;

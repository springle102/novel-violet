const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// POST /api/admin/login
async function login(req, res, next) {
  console.log("\n[ADMIN-AUTH-LOGIN] >>> Nhận yêu cầu đăng nhập Admin mới");
  console.log("[ADMIN-AUTH-LOGIN] Email:", req.body.email);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn("[ADMIN-AUTH-LOGIN] Thiếu Email hoặc Mật khẩu");
      return res.status(400).json({ success: false, error: "Email và mật khẩu là bắt buộc." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Chỉ truy vấn vào bảng admins
    const adminQuery = `
      SELECT id, username, email, password, avatar_url, created_at
      FROM admins
      WHERE email = $1
    `;
    const result = await db.query(adminQuery, [normalizedEmail]);

    if (result.rows.length === 0) {
      console.warn(`[ADMIN-AUTH-LOGIN] Không tìm thấy admin: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác.",
      });
    }

    const admin = result.rows[0];

    // So sánh mật khẩu dạng plain text
    const isPasswordValid = password === admin.password;
    if (!isPasswordValid) {
      console.warn(`[ADMIN-AUTH-LOGIN] Sai mật khẩu cho admin: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // Cập nhật last_login_at
    await db.query("UPDATE admins SET last_login_at = NOW() WHERE id = $1", [admin.id]);

    // Tạo JWT Token với payload phân biệt role 'admin'
    // Đặt cả 'id' và 'userId' để vừa tương thích với yêu cầu vừa tương thích với code hiện tại
    const tokenPayload = { 
      id: admin.id, 
      userId: admin.id, 
      email: admin.email, 
      role: 'admin' 
    };

    console.log("[ADMIN-AUTH-LOGIN] Đang tạo JWT token...");
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "novel-violet",
      subject: admin.id,
    });
    console.log("[ADMIN-AUTH-LOGIN] ✓ Đăng nhập Admin thành công");

    res.status(200).json({
      success: true,
      message: "Đăng nhập admin thành công!",
      data: {
        token,
        user: {
          id: admin.id,
          fullName: admin.username,
          email: admin.email,
          role: 'admin',
          avatarUrl: admin.avatar_url,
          createdAt: admin.created_at,
        },
      },
    });
  } catch (err) {
    console.error("[ADMIN-AUTH-LOGIN] ❌ Lỗi đăng nhập Admin:", err);
    next(err);
  }
}

module.exports = { login };

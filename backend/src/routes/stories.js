// ============================================================
// Trạm Chữ Novel — Stories Routes
// ============================================================
// Định nghĩa các route cho resource /api/stories
// Mỗi route map tới 1 controller function tương ứng.
// ============================================================

const { Router } = require("express");
const storiesController = require("../controllers/storiesController");

const router = Router();

// GET /api/stories?page=1&limit=20
// ★ API mẫu: Lấy danh sách tất cả truyện từ bảng Stories (có phân trang)
router.get("/", storiesController.getAllStories);

// GET /api/stories/latest?page=1&limit=10
// Lấy danh sách truyện mới cập nhật nhất (có phân trang)
router.get("/latest", storiesController.getLatestStories);

// GET /api/stories/:slug
// Lấy chi tiết truyện theo slug
// ⚠️ Route này phải đặt SAU /latest để tránh "latest" bị match như :slug
router.get("/:slug", storiesController.getStoryBySlug);

// POST /api/stories
// Tạo truyện mới (yêu cầu authorId trong body)
router.post("/", storiesController.createStory);

module.exports = router;

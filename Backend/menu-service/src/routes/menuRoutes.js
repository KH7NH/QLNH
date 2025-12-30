// src/routes/menuRoutes.js
const express = require("express");
const router = express.Router();

const menuController = require("../controller/menuController");
const authMiddleware = require("../middleware/authMiddleware");
// const authorizeRoles = require("../middleware/roleMiddleware"); // nếu cần phân quyền thì bật lại

// Tất cả route dưới đây yêu cầu đăng nhập (đúng như bạn đang làm)
router.use(authMiddleware);

// ✅ GET /monan  -> lấy danh sách món
router.get("/", menuController.getAllMonAn);

// ✅ POST /monan -> thêm món
router.post("/", menuController.createMonAn);

// ✅ PUT /monan/:id -> sửa món
router.put("/:id", menuController.updateMonAn);

// ✅ DELETE /monan/:id -> xóa món
router.delete("/:id", menuController.deleteMonAn);

// (test) GET /monan/ping
router.get("/ping", (req, res) => res.json({ ok: true, service: "menu" }));

module.exports = router;

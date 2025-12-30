// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const orderController = require("../controller/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// tất cả route đều yêu cầu đăng nhập
router.use(authMiddleware);

// ✅ Danh sách hóa đơn: Quản lý + Bếp (tuỳ bạn, có thể thêm Nhân viên nếu cần)
router.get("/", authorizeRoles("Quản lý", "Bếp"), orderController.getAllOrders);

// ✅ Chi tiết hóa đơn
router.get("/:id", authorizeRoles("Quản lý", "Bếp"), orderController.getOrderById);

// ✅ Cập nhật trạng thái: CHỈ Bếp (hoặc thêm Quản lý nếu bạn muốn)
router.put("/:id/status", authorizeRoles("Bếp", "Quản lý"), orderController.updateOrderStatus);

// (tuỳ hệ thống) tạo đơn hàng: Nhân viên + Quản lý
router.post("/", authorizeRoles("Nhân viên", "Quản lý"), orderController.createOrder);

module.exports = router;

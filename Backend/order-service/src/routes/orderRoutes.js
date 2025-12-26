// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');


// Tất cả route bên dưới đều yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ admin mới được xem toàn bộ đơn
router.get('/orders', authorizeRoles('admin'), orderController.getAllOrders);

// Nhân viên + admin đều có thể tạo đơn
router.post('/orders', authorizeRoles('admin', 'staff'), orderController.createOrder);

// ĐẶT HÀNG (đã có sẵn từ trước)
router.post('/create', orderController.createOrder);

// 🆕 LẤY DANH SÁCH HÓA ĐƠN
router.get('/', orderController.getAllOrders);

// 🆕 LẤY CHI TIẾT 1 HÓA ĐƠN
router.get('/:id', orderController.getOrderById);

// 🆕 CẬP NHẬT TRẠNG THÁI
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;

// routes/menuRoutes.js
const express = require('express');
const router = express.Router();

// 🔴 Require controller – phải trỏ đúng đường dẫn
const menuController = require('../controller/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');


// Tất cả route bên dưới đều yêu cầu đăng nhập
router.use(authMiddleware);

// Xem danh sách món – bất kỳ ai đã đăng nhập
router.get('/monan', menuController.getAllMonAn);


// ✅ API lấy danh sách món ăn
router.get('/monan', menuController.getAllMonAn);

// ✅ API thêm món ăn
router.post('/monan', menuController.createMonAn);

// ✅ API cập nhật món ăn
router.put('/monan/:id', menuController.updateMonAn);

// ✅ API xóa món ăn
router.delete('/monan/:id', menuController.deleteMonAn);

// (Tuỳ chọn) Route test
router.get('/', (req, res) => {
  res.send('✅ Menu route đang hoạt động!');
});

module.exports = router;

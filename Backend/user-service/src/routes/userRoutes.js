// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// ===== Public routes (KHÔNG cần token) =====
router.post('/login', userController.loginUser);

// ===== Từ đây trở xuống: yêu cầu đã đăng nhập =====
router.use(authMiddleware);

// Logout (JWT logout client-side là chính)
router.post('/logout', userController.logoutUser);

// ✅ Nhân viên: chỉ "Quản lý" (và/hoặc Admin nếu bạn muốn)
router.get('/nhanvien', authorizeRoles('Quản lý'), userController.getAllNhanVien);

// Thêm/Sửa/Xóa nhân viên: cũng nên giới hạn role
router.post('/nhanvien', authorizeRoles('Quản lý'), userController.createNhanVien);
router.put('/nhanvien/:id', authorizeRoles('Quản lý'), userController.updateNhanVien);
router.delete('/nhanvien/:id', authorizeRoles('Quản lý'), userController.deleteNhanVien);

router.get('/', (req, res) => {
  res.send('✅ User route đang hoạt động!');
});

module.exports = router;

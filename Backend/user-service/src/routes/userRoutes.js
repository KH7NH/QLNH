const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');


// ===== Các route KHÔNG yêu cầu đăng nhập (nếu  còn dùng) =====
router.post('/login', userController.loginUser);
// nếu muốn logout phải có token thì có thể thêm authMiddleware:
router.post('/logout', authMiddleware, userController.logoutUser);

// ===== Từ đây trở xuống: yêu cầu đã đăng nhập =====
router.use(authMiddleware);

// Lấy danh sách nhân viên – chỉ admin
router.get('/nhanvien', authorizeRoles('admin'), userController.getAllNhanVien);


// Lấy danh sách
router.get('/nhanvien', userController.getAllNhanVien);

// Thêm
router.post('/nhanvien', userController.createNhanVien);

// Sửa
router.put('/nhanvien/:id', userController.updateNhanVien);

// Xóa
router.delete('/nhanvien/:id', userController.deleteNhanVien);

// Login / Logout
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);

router.get("/", (req, res) => {
  res.send("✅ User route đang hoạt động!");
});

module.exports = router;

// src/middleware/roleMiddleware.js
function authorizeRoles(...roles) {
  return (req, res, next) => {
    // VaiTro là cột thật trong bảng NhanVien
    if (!req.user || !roles.includes(req.user.VaiTro)) {
      return res.status(403).json({ message: 'Không đủ quyền truy cập' });
    }
    next();
  };
}

module.exports = authorizeRoles;

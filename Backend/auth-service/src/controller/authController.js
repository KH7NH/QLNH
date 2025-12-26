// auth-service/src/controller/authController.js
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');

function generateToken(user) {
  return jwt.sign(
    {
      IDNV: user.IDNV,
      Username: user.Username,
      VaiTro: user.VaiTro, // role thật
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('username', username)
      .input('password', password)
      .query(`
        SELECT * FROM NhanVien
        WHERE Username = @username AND PasswordHash = @password
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: '❌ Sai tên đăng nhập hoặc mật khẩu' });
    }

    const user = result.recordset[0];

    const token = generateToken(user);

    res.json({
      message: '✅ Đăng nhập thành công!',
      token,
      user: {
        IDNV: user.IDNV,
        TenNV: user.TenNV,
        Username: user.Username,
        VaiTro: user.VaiTro,   // admin / staff / manager
      },
    });
  } catch (err) {
    console.error('❌ Lỗi đăng nhập:', err);
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

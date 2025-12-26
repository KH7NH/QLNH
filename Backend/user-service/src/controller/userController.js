// controllers/userController.js
const { poolPromise } = require('../config/db');

// ====================== LOGIN ======================
exports.loginUser = async (req, res) => {
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

    if (result.recordset.length > 0) {
  const nv = result.recordset[0]; // nv chứa: IDNV, TenNV, VaiTro, Username, PasswordHash...

  res.json({
    message: '✅ Đăng nhập thành công!',
    user: nv,           // gửi toàn bộ nhân viên về FE
    VaiTro: nv.VaiTro   // gửi riêng vai trò cho dễ lấy
  });
}
// khong co 2 key vi key 2 se ghi de key 1
    else {
      res.status(401).json({ message: '❌ Sai tên đăng nhập hoặc mật khẩu' });
    }
  } catch (err) {
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

// ====================== LOGOUT ======================
exports.logoutUser = async (req, res) => {
  res.json({ message: '✅ Đăng xuất thành công!' });
};

// ====================== GET ALL ======================
exports.getAllNhanVien = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM NhanVien
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

// ====================== CREATE ======================
exports.createNhanVien = async (req, res) => {
  try {
    const { TenNV, VaiTro, Username, PasswordHash } = req.body;

    if (!TenNV || !VaiTro || !Username || !PasswordHash) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('TenNV', TenNV)
      .input('VaiTro', VaiTro)
      .input('Username', Username)
      .input('PasswordHash', PasswordHash)
      .query(`
        INSERT INTO NhanVien (TenNV, VaiTro, Username, PasswordHash)
        VALUES (@TenNV, @VaiTro, @Username, @PasswordHash);
        SELECT SCOPE_IDENTITY() AS IDNV;
      `);

    const newId = result.recordset[0].IDNV;

    res.status(201).json({
      message: '✅ Thêm nhân viên thành công!',
      nhanvien: { IDNV: newId, TenNV, VaiTro, Username, PasswordHash }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

// ====================== UPDATE ======================
exports.updateNhanVien = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenNV, VaiTro, Username, PasswordHash } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input('IDNV', id)
      .input('TenNV', TenNV)
      .input('VaiTro', VaiTro)
      .input('Username', Username)
      .input('PasswordHash', PasswordHash)
      .query(`
        UPDATE NhanVien
        SET TenNV = @TenNV,
            VaiTro = @VaiTro,
            Username = @Username,
            PasswordHash = @PasswordHash
        WHERE IDNV = @IDNV;

        SELECT * FROM NhanVien WHERE IDNV = @IDNV;
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json({
      message: '✅ Cập nhật nhân viên thành công!',
      nhanvien: result.recordset[0]
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

// ====================== DELETE ======================
exports.deleteNhanVien = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input('IDNV', id)
      .query(`
        DELETE FROM NhanVien WHERE IDNV = @IDNV
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa' });
    }

    res.json({ message: '✅ Xóa nhân viên thành công!' });

  } catch (err) {
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

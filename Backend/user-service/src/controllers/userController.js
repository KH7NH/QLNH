// controllers/userController.js
const { poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', username)
      .input('password', password)
      .query(`
        SELECT * FROM NhanVien
        WHERE Username = @username AND PasswordHash = @password
      `);

    if (!result.recordset.length) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const nv = result.recordset[0];

    const token = jwt.sign(
      {
        IDNV: nv.IDNV,
        Username: nv.Username,
        VaiTro: nv.VaiTro
      },
      process.env.JWT_SECRET || 'KHUEFOOD_SECRET',
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        IDNV: nv.IDNV,
        TenNV: nv.TenNV,
        Username: nv.Username,
        VaiTro: nv.VaiTro
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// ====================== LOGOUT ======================
exports.logoutUser = async (req, res) => {
  // JWT không cần logout phía server
  res.json({ message: '✅ Đăng xuất thành công!' });
};

// ====================== GET ALL NHÂN VIÊN ======================
exports.getAllNhanVien = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT IDNV, TenNV, Username, VaiTro
      FROM NhanVien
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('GET ALL ERROR:', err);
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

    res.status(201).json({
      message: '✅ Thêm nhân viên thành công!',
      nhanvien: {
        IDNV: result.recordset[0].IDNV,
        TenNV,
        VaiTro,
        Username
      }
    });

  } catch (err) {
    console.error('CREATE ERROR:', err);
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

        SELECT IDNV, TenNV, Username, VaiTro FROM NhanVien WHERE IDNV = @IDNV;
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json({
      message: '✅ Cập nhật nhân viên thành công!',
      nhanvien: result.recordset[0]
    });

  } catch (err) {
    console.error('UPDATE ERROR:', err);
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
      .query(`DELETE FROM NhanVien WHERE IDNV = @IDNV`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa' });
    }

    res.json({ message: '✅ Xóa nhân viên thành công!' });

  } catch (err) {
    console.error('DELETE ERROR:', err);
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

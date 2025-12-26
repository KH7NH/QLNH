// controllers/menuController.js
const { poolPromise } = require('../config/db');

/**
 * LẤY DANH SÁCH TẤT CẢ MÓN ĂN
 */
exports.getAllMonAn = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM MonAn
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách món ăn:', err);
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

/**
 * THÊM MÓN ĂN MỚI
 * SỬA: IDMA là IDENTITY => KHÔNG nhận IDMA từ body, KHÔNG insert IDMA.
 * SQL tự sinh ID, sau đó ta lấy lại bằng SCOPE_IDENTITY().
 */
exports.createMonAn = async (req, res) => {
  try {
    const { TenMA, Gia, TrangThai, MoTa, AnhMon } = req.body;

    // SỬA: Không cần IDMA nữa
    if (!TenMA || Gia == null || !TrangThai || !MoTa || !AnhMon) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('TenMA', TenMA)
      .input('Gia', Gia)
      .input('TrangThai', TrangThai)
      .input('MoTa', MoTa)
      .input('AnhMon', AnhMon)
      .query(`
        INSERT INTO MonAn (TenMA, Gia, TrangThai, MoTa, AnhMon)
        VALUES (@TenMA, @Gia, @TrangThai, @MoTa, @AnhMon);

        SELECT SCOPE_IDENTITY() AS IDMA; -- lấy ID mới tạo
      `);

    const newId = result.recordset[0].IDMA;

    res.status(201).json({
      message: '✅ Thêm món ăn thành công!',
      monan: { IDMA: newId, TenMA, Gia, TrangThai, MoTa, AnhMon }
    });
  } catch (err) {
    console.error('Lỗi thêm món ăn:', err);
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

/**
 * CẬP NHẬT MÓN ĂN
 * SỬA: Không cập nhật IDMA, chỉ WHERE theo IDMA từ params.
 */
exports.updateMonAn = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenMA, Gia, TrangThai, MoTa, AnhMon } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input('IDMA', id)
      .input('TenMA', TenMA)
      .input('Gia', Gia)
      .input('TrangThai', TrangThai)
      .input('MoTa', MoTa)
      .input('AnhMon', AnhMon)
      .query(`
        UPDATE MonAn
        SET TenMA = @TenMA,
            Gia = @Gia,
            TrangThai = @TrangThai,
            MoTa = @MoTa,
            AnhMon = @AnhMon
        WHERE IDMA = @IDMA;

        SELECT * FROM MonAn WHERE IDMA = @IDMA;
      `);

    const updated = result.recordset[0];
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    res.json({
      message: '✅ Cập nhật món ăn thành công!',
      monan: updated
    });
  } catch (err) {
    console.error('Lỗi cập nhật món ăn:', err);
    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};

/**
 * XÓA MÓN ĂN
 */
exports.deleteMonAn = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('IDMA', id)
      .query(`DELETE FROM MonAn WHERE IDMA = @IDMA`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn để xóa' });
    }

    res.json({ message: '✅ Xóa món ăn thành công!' });
  } catch (err) {
    console.error('Lỗi xóa món ăn:', err);

    // 👉 ĐỌC CHUỖI LỖI, THẤY CÂU "DELETE statement conflicted with the REFERENCE"
    const msg =
      (err && err.message) ||
      (err && err.originalError && err.originalError.message) ||
      (err && err.error) ||
      '';

    if (String(msg).includes('DELETE statement conflicted with the REFERENCE')) {
      return res.status(400).json({
        message: '❌ Không thể xóa món ăn vì đã được sử dụng trong đơn hàng (ChiTietDonHang).'
      });
    }

    res.status(500).json({ message: '❌ Lỗi server', error: err.message });
  }
};


// Backend/order-service/src/controller/orderController.js
const sql = require("mssql");
const { config } = require("../config/db");

/**
 * TẠO ĐƠN HÀNG
 * Body:
 * {
 *   IDNV: number,
 *   TenKhachHang: string,
 *   GhiChu?: string,
 *   ChiTiet: [{ IDMA: number, SoLuong: number, DonGia?: number, GhiChu?: string }]
 * }
 */
exports.createOrder = async (req, res) => {
  const { IDNV, TenKhachHang, GhiChu, ChiTiet } = req.body;

  // Validate input cơ bản
  if (!TenKhachHang || !Array.isArray(ChiTiet) || ChiTiet.length === 0) {
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
  }

  // Validate từng item: bắt buộc có IDMA
  const badItem = ChiTiet.find((x) => !x || !x.IDMA);
  if (badItem) {
    return res.status(400).json({
      message: "ChiTiet có món thiếu IDMA",
      badItem,
    });
  }

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1) Tạo DonHang
    const reqOrder = new sql.Request(transaction);
    const insertOrder = await reqOrder
      .input("IDNV", sql.Int, IDNV || 1)
      .input("TenKhachHang", sql.NVarChar, TenKhachHang)
      .input("GhiChu", sql.NVarChar, GhiChu || null)
      .query(`
        INSERT INTO DonHang (IDNV, TenKhachHang, GhiChu)
        OUTPUT INSERTED.IDDonHang
        VALUES (@IDNV, @TenKhachHang, @GhiChu);
      `);

    const orderId = insertOrder.recordset?.[0]?.IDDonHang;
    if (!orderId) throw new Error("Không tạo được DonHang (không có IDDonHang)");

    // 2) Insert ChiTietDonHang
    for (const item of ChiTiet) {
      const IDMA = Number(item.IDMA);
      const SoLuong = Number(item.SoLuong || 1);

      if (!Number.isFinite(IDMA) || IDMA <= 0) {
        throw new Error(`IDMA không hợp lệ: ${item.IDMA}`);
      }
      if (!Number.isFinite(SoLuong) || SoLuong <= 0) {
        throw new Error(`SoLuong không hợp lệ cho IDMA=${IDMA}: ${item.SoLuong}`);
      }

      await new sql.Request(transaction)
        .input("IDDonHang", sql.Int, orderId)
        .input("IDMA", sql.Int, IDMA)
        .input("SoLuong", sql.Int, SoLuong)
        .input("GhiChu", sql.NVarChar, item.GhiChu || null)
        .query(`
          INSERT INTO ChiTietDonHang (IDDonHang, IDMA, SoLuong, GhiChu)
          VALUES (@IDDonHang, @IDMA, @SoLuong, @GhiChu);
        `);
    }

    // 3) Tính tổng tiền từ DB (Gia trong MonAn) và insert HoaDon
    const totalRs = await new sql.Request(transaction)
      .input("IDDonHang", sql.Int, orderId)
      .query(`
        SELECT SUM(ma.Gia * ct.SoLuong) AS Tong
        FROM ChiTietDonHang ct
        JOIN MonAn ma ON ma.IDMA = ct.IDMA
        WHERE ct.IDDonHang = @IDDonHang;
      `);

    const tongTien = totalRs.recordset?.[0]?.Tong || 0;

    await new sql.Request(transaction)
      .input("IDDonHang", sql.Int, orderId)
      .input("TongTien", sql.Decimal(10, 2), tongTien)
      .query(`
        INSERT INTO HoaDon (IDDonHang, TongTien)
        VALUES (@IDDonHang, @TongTien);
      `);

    await transaction.commit();
    return res.json({ message: "Tạo đơn hàng thành công", orderId, tongTien });
  } catch (err) {
    console.error("❌ Lỗi tạo đơn hàng:", err);
    try {
      await transaction.rollback();
    } catch {}
    return res.status(500).json({ message: err.message || "Lỗi server khi tạo đơn" });
  }
};

/**
 * LẤY DANH SÁCH TẤT CẢ HÓA ĐƠN (JOIN DonHang + HoaDon)
 * Dùng cho hoadon.html
 */
exports.getAllOrders = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        dh.IDDonHang AS IDDH,
        dh.TenKhachHang, 
        dh.GhiChu,
        dh.Ngay AS ThoiGian,
        dh.TrangThai,
        hd.TongTien
      FROM DonHang dh
      LEFT JOIN HoaDon hd ON dh.IDDonHang = hd.IDDonHang
      ORDER BY dh.Ngay DESC;
    `);

    return res.json(result.recordset || []);
  } catch (err) {
    console.error("Lỗi getAllOrders:", err);
    return res.status(500).json({
      message: "❌ Lỗi server khi lấy danh sách hóa đơn",
      error: err.message,
    });
  }
};

/**
 * LẤY CHI TIẾT 1 HÓA ĐƠN THEO IDDonHang
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // IDDonHang

    const pool = await sql.connect(config);

    // 1) Header
    const headerResult = await pool.request().input("IDDonHang", sql.Int, id).query(`
      SELECT 
        IDDonHang AS IDDH,
        TenKhachHang,
        GhiChu,
        Ngay AS ThoiGian,
        TrangThai
      FROM DonHang
      WHERE IDDonHang = @IDDonHang;
    `);

    if (!headerResult.recordset?.length) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    const order = headerResult.recordset[0];

    // 2) Detail
    const detailResult = await pool.request().input("IDDonHang", sql.Int, id).query(`
      SELECT 
        ct.IDMA,
        ct.SoLuong,
        ct.GhiChu,
        ma.TenMA AS TenMon,
        ma.Gia AS DonGia
      FROM ChiTietDonHang ct
      JOIN MonAn ma ON ct.IDMA = ma.IDMA
      WHERE ct.IDDonHang = @IDDonHang;
    `);

    const chiTiet = (detailResult.recordset || []).map((row) => ({
      IDMA: row.IDMA,
      TenMon: row.TenMon || "",
      SoLuong: row.SoLuong || 0,
      DonGia: row.DonGia || 0,
      GhiChu: row.GhiChu || "",
    }));

    order.ChiTiet = chiTiet;

    // 3) Tổng tiền
    order.TongTien = chiTiet.reduce(
      (sum, x) => sum + (Number(x.SoLuong) || 0) * (Number(x.DonGia) || 0),
      0
    );

    return res.json(order);
  } catch (err) {
    console.error("Lỗi getOrderById:", err);
    return res.status(500).json({
      message: "❌ Lỗi server khi lấy chi tiết hóa đơn",
      error: err.message,
    });
  }
};

/**
 * CẬP NHẬT TRẠNG THÁI HÓA ĐƠN
 * PUT /order/:id/status  body: { TrangThai: "Hoàn thành" }
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // IDDonHang
    const { TrangThai } = req.body;

    if (!TrangThai) {
      return res.status(400).json({ message: "Thiếu trạng thái cần cập nhật" });
    }

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("IDDonHang", sql.Int, id)
      .input("TrangThai", sql.NVarChar, TrangThai)
      .query(`
        UPDATE DonHang
        SET TrangThai = @TrangThai
        WHERE IDDonHang = @IDDonHang;

        SELECT @@ROWCOUNT AS rows;
      `);

    const rows = result.recordset?.[0]?.rows || 0;
    if (rows === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn để cập nhật" });
    }

    return res.json({ message: "✅ Cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("Lỗi updateOrderStatus:", err);
    return res.status(500).json({
      message: "❌ Lỗi server khi cập nhật trạng thái",
      error: err.message,
    });
  }
};

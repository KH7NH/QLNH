// auth-service/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" })); // tránh body quá lớn
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

// Health check (tiện test)
app.get("/", (req, res) => res.send("Auth-service running"));

// ✅ Ưu tiên PORT từ PM2. Nếu không có thì fallback 5000 (không dùng 4000 nữa)
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Auth-service đang chạy tại cổng ${PORT}`);
});

// Log env để debug (có thể xoá sau)
console.log("Auth-service ENV PORT =", process.env.PORT);

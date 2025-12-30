// Backend/api-gateway/server.js
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());
app.use(express.json());

function makeProxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 15000,
    timeout: 15000,
    pathRewrite,
    logLevel: "debug",
    onProxyReq(proxyReq, req, res) {
      // đảm bảo body được forward (một số case proxy bị rỗng body)
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError(err, req, res) {
      console.error("❌ GATEWAY PROXY ERROR:", err.code || err.message);
      if (!res.headersSent) {
        res.status(502).json({ message: "Gateway proxy error", error: err.code || err.message });
      }
    }
  });
}

// ✅ AUTH
app.use("/auth", makeProxy("http://localhost:5000"));

// Users
app.use("/api/users", makeProxy("http://localhost:5001", { "^/api/users": "/users" }));

// Menu
app.use("/api/monan", makeProxy("http://localhost:5003", { "^/api/monan": "/monan" }));

// Order
app.use("/api/order", makeProxy("http://localhost:5002", { "^/api/order": "/order" }));

app.get("/", (req, res) => res.send("API Gateway running"));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`));

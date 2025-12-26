// Backend/api-gateway/server.js
const express = require("express");//api
const cors = require("cors");//be
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());

// User Service: rewrite /api/users/... -> /users/...
app.use("/api/users", createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' }
}));

// Menu Service: rewrite /api/monan/... -> /monan/...
app.use("/api/monan", createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
    pathRewrite: { '^/api/monan': '/monan' }
}));

// Order Service: rewrite /api/order/... -> /order/...
app.use("/api/order", createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: { '^/api/order': '/order' }
}));

app.listen(3000, () =>
    console.log("🚀 API Gateway đang chạy tại http://localhost:3000")
);
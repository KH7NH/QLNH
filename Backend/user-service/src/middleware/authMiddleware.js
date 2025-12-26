// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { IDNV, Username, VaiTro, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

module.exports = authMiddleware;

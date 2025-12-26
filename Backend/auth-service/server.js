// auth-service/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise } = require('./src/config/db');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Auth-service đang chạy tại cổng ${PORT}`);
});

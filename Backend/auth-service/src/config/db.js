// auth-service/src/config/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Auth-service: Kết nối SQL Server thành công!');
    return pool;
  })
  .catch(err => {
    console.error('❌ Auth-service: Lỗi kết nối SQL Server:', err);
  });

module.exports = {
  sql,
  poolPromise,
  config,
};

// auth-service/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/login', authController.login);

router.get('/', (req, res) => {
  res.send('Auth-service OK');
});

module.exports = router;

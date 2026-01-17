const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definir la ruta POST para login
router.post('/login', authController.login);

module.exports = router;
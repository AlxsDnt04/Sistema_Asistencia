// src/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, usuarioController.getUsuarios);

module.exports = router;
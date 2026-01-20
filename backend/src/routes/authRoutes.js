const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const asistenciaController = require('../controllers/asistenciaController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// Definir la ruta POST para login
router.post('/login', authController.login);
// Definir la ruta protegida para registrar asistencia
router.post('/registrar-asistencia', authMiddleware, asistenciaController.registrarAsistencia);

module.exports = router;
// backend/src/routes/asistenciaRoutes.js
const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const authMiddleware = require('../middlewares/authMiddleware'); // Para saber qué alumno es

// Ruta: POST /api/asistencia/registrar
// El middleware verifica que el alumno esté logueado (tenga token de usuario)
router.post('/registrar', authMiddleware, asistenciaController.registrarAsistencia);

module.exports = router;
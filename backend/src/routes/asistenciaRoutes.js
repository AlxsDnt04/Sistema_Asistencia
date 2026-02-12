// backend/src/routes/asistenciaRoutes.js
const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const authMiddleware = require('../middlewares/authMiddleware'); // Para saber qué alumno es

// Ruta para pedir un nuevo QR
router.post('/generar-qr', authMiddleware, asistenciaController.generarQrMateria);
// El middleware verifica que el alumno esté logueado (tenga token de usuario)
router.get('/diario', authMiddleware, asistenciaController.obtenerReporteDiario);
router.get('/historial', asistenciaController.obtenerHistorial);
router.get('/hoy', asistenciaController.obtenerAsistenciasDeHoy);
router.post('/registrar', authMiddleware, asistenciaController.registrarAsistencia);
router.delete('/:id', authMiddleware, asistenciaController.eliminarAsistencia);

module.exports = router;
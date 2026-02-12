// src/routes/matriculaRoutes.js
const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para archivos subidos

// Ruta para vincular uno a uno (por Cédula)
router.post('/vincular', matriculaController.vincularAlumno);
router.post('/masiva', upload.single('archivoExcel'), matriculaController.cargaMasiva);

router.put('/alumnos/:id', matriculaController.updateStudent);
router.delete('/alumnos/:id', matriculaController.deleteStudent);
// ruta dinamica
router.delete('/:estudianteId/:materiaId', matriculaController.desmatricular);

module.exports = router;
const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');

router.get('/materia/:materiaId', alumnoController.obtenerAlumnosPorMateria);
router.delete('/matricula/:materiaId/:estudianteId', alumnoController.desmatricularAlumno);

module.exports = router;
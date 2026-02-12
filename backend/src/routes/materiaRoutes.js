const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, materiaController.obtenerMaterias);
router.get('/:id/estudiantes', authMiddleware, materiaController.obtenerEstudiantesPorMateria);
router.post('/', authMiddleware, materiaController.crearMateria);
router.put('/:id', authMiddleware, materiaController.actualizarMateria);
router.delete('/:id', materiaController.eliminarMateria);

module.exports = router;
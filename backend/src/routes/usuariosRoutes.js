// src/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, usuarioController.getUsuarios); // listar
router.post('/', authMiddleware, usuarioController.createUsuario); // Crear
router.put('/:id', authMiddleware, usuarioController.updateUsuario); // Editar
router.delete('/:id', authMiddleware, usuarioController.deleteUsuario); // Eliminar

module.exports = router;
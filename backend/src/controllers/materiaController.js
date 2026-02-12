const { Materia, Usuario } = require('../models');

// OBTENER MATERIAS
exports.obtenerMaterias = async (req, res) => {
    try {
        const usuarioLogueado = req.user; // middleware auth
        let whereCondition = {};

        // SI NO ES ADMIN, SOLO VE SUS MATERIAS
        if (usuarioLogueado.rol !== 'admin') {
            whereCondition = { profesorId: usuarioLogueado.id };
        }

        const materias = await Materia.findAll({
            where: whereCondition,
            include: [{
                model: Usuario,
                as: 'profesor',
                attributes: ['id', 'nombre', 'email']
            }],
            order: [['createdAt', 'DESC']] // Ordenar por más reciente
        });
        res.json(materias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener materias' });
    }
};

// CREAR MATERIA
exports.crearMateria = async (req, res) => {
    try {
        const { nombre, codigo, profesorId } = req.body;
        
        if (!nombre || !codigo || !profesorId) {
            return res.status(400).json({ message: 'Nombre, Código y Profesor son obligatorios' });
        }

        const nuevaMateria = await Materia.create({
            nombre,
            codigo,
            profesorId // Ahora el admin decide quién es el profe
        });
        res.json(nuevaMateria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear materia' });
    }
};

// ACTUALIZAR MATERIA
exports.actualizarMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, codigo, profesorId } = req.body; // También permitimos cambiar profe

        const materia = await Materia.findByPk(id);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

        materia.nombre = nombre;
        materia.codigo = codigo;
        if (profesorId) materia.profesorId = profesorId;
        
        await materia.save();

        res.json({ message: 'Materia actualizada', materia });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar materia' });
    }
};

// ELIMINAR MATERIA
exports.eliminarMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await Materia.destroy({ where: { id } });
        
        if (resultado === 0) return res.status(404).json({ message: 'Materia no encontrada' });
        
        res.json({ message: 'Materia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar materia' });
    }
};

// Obtener estudiantes
exports.obtenerEstudiantesPorMateria = async (req, res) => {
    try {
        const { id } = req.params; 
        const materia = await Materia.findByPk(id, {
            include: [{
                model: Usuario,
                as: 'estudiantesInscritos', 
                attributes: ['id', 'nombre', 'email', 'rol', 'device_id'],
                through: { attributes: [] } 
            }]
        });

        if (!materia) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }

        res.json(materia.estudiantesInscritos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estudiantes de la materia' });
    }
};
// backend/src/controllers/asistenciaController.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const Asistencia = require('../models/Asistencia');
const Usuario = require('../models/Usuario');
const sequelize = require('../config/database');

exports.registrarAsistencia = async (req, res) => {
    try {
        const { qrToken } = req.body;
        
        // 1. Validaciones básicas
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'No autenticado' });
        if (!qrToken) return res.status(400).json({ message: 'Falta el código QR' });

        // 2. Validar JWT del QR
        try {
            jwt.verify(qrToken, 'mi_clave_secreta_super_segura_123');
        } catch (error) {
            return res.status(400).json({ message: 'El código QR ha expirado o no es válido.' });
        }

        const usuarioId = req.user.id;
        const MATERIA_POR_DEFECTO = 1;
        const hoy = new Date();
        const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
        const finDia = new Date(hoy.setHours(23, 59, 59, 999));

        // 3. BLOQUEO DE DUPLICADOS
        const asistenciaExistente = await Asistencia.findOne({
            where: {
                usuarioId: usuarioId,
                createdAt: { [Op.between]: [inicioDia, finDia] }
            }
        });

        if (asistenciaExistente) {
            // Código 409: Conflict
            return res.status(409).json({ message: '⚠️ Ya registraste asistencia el día de hoy.' });
        }

        // 4. Registro
        const nuevaAsistencia = await Asistencia.create({
            usuarioId,
            materiaId: MATERIA_POR_DEFECTO,
            estado: 'presente',
            fecha: new Date(),
            hora_registro: new Date().toTimeString().split(' ')[0]
        });

        // 5. Socket
        const alumno = await Usuario.findByPk(usuarioId);
        const io = req.app.get('socketio');
        if (io) {
            io.emit('asistencia-registrada', {
                id: nuevaAsistencia.id,
                nombre: alumno ? alumno.nombre : 'Estudiante',
                hora: new Date().toLocaleTimeString(),
                fecha: new Date().toLocaleDateString()
            });
        }

        res.json({ message: 'Asistencia registrada correctamente' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Nueva función para Reportes del Día
exports.obtenerReporteDiario = async (req, res) => {
    try {
        const hoy = new Date();
        const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
        const finDia = new Date(hoy.setHours(23, 59, 59, 999));

        const asistencias = await Asistencia.findAll({
            where: { createdAt: { [Op.between]: [inicioDia, finDia] } },
            include: [{ model: Usuario, attributes: ['nombre', 'email', 'rol'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar reporte' });
    }
};

exports.obtenerHistorial = async (req, res) => {
    try {
        // Consulta SQL para agrupar por fecha y contar asistentes
        // Devuelve: [ { fecha: '2023-10-20', total: 15 }, ... ]
        const historial = await Asistencia.findAll({
            attributes: [
                'fecha',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_asistentes']
            ],
            group: ['fecha'],
            order: [['fecha', 'DESC']]
        });
        res.json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener historial' });
    }
};
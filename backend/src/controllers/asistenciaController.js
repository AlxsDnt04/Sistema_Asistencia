// backend/src/controllers/asistenciaController.js
const jwt = require('jsonwebtoken');
const Asistencia = require('../models/Asistencia');
const Usuario = require('../models/Usuario');

exports.registrarAsistencia = async (req, res) => {
    try {
        console.log('📩 Petición de asistencia recibida');
        
        const { qrToken } = req.body;
        
        // Validación de seguridad defensiva
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Error de autenticación interna' });
        }

        const usuarioId = req.user.id;

        if (!qrToken) {
            return res.status(400).json({ message: 'Falta el código QR' });
        }

        // 1. Verificar Token del QR
        try {
            jwt.verify(qrToken, 'TU_SECRETO_SUPER_SEGURO');
        } catch (error) {
            return res.status(400).json({ message: 'El código QR ha expirado.' });
        }

        // --- CORRECCIÓN DE HORA ---
        const now = new Date();
        // toTimeString() devuelve algo como "21:58:38 GMT-0500..."
        // Hacemos split(' ')[0] para quedarnos solo con "21:58:38"
        const horaFormatoSQL = now.toTimeString().split(' ')[0]; 

        // 2. Registrar en Base de Datos
        const nuevaAsistencia = await Asistencia.create({
            usuarioId: usuarioId,
            estado: 'presente',
            fecha: now,             // Sequelize maneja bien el objeto Date completo para fechas
            hora_registro: horaFormatoSQL // Enviamos el formato "21:58:38" 
        });

        console.log('✅ Asistencia guardada en BD:', nuevaAsistencia.id);

        // 3. Notificar al Profesor (Socket)
        const alumno = await Usuario.findByPk(usuarioId);
        const io = req.app.get('socketio');
        
        if (io) {
            // Al profesor sí le podemos mandar el formato bonito con "p. m." si queremos
            io.emit('asistencia-registrada', {
                nombre: alumno ? alumno.nombre : 'Estudiante',
                hora: now.toLocaleTimeString() 
            });
        }

        res.json({ message: 'Asistencia registrada con éxito' });

    } catch (error) {
        console.error('Error en registrarAsistencia:', error); // Esto imprimirá el error real si pasa algo más
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
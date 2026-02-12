// backend/src/controllers/asistenciaController.js
require('dotenv').config();
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { Asistencia, Usuario, Matricula, Materia } = require("../models");
const sequelize = require("../config/database");

exports.registrarAsistencia = async (req, res) => {
  try {
    const usuarioId = req.user.id; 
    const { qrData, qrToken } = req.body; 
    // Se usa cualquiera de los dos, priorizando qrToken
    let tokenRecibido = qrToken || qrData; 

    console.log("--------------------------------------------------");
    console.log(`📡 INTENTO DE REGISTRO - Usuario: ${usuarioId}`);
    
    if (!tokenRecibido) {
        return res.status(400).json({ message: "No se recibió el código QR." });
    }

    // 1. LIMPIEZA DE DATOS
    if (typeof tokenRecibido === 'string') {
        tokenRecibido = tokenRecibido.replace(/^"|"$/g, '').trim();
    }
    
    let materiaId = null;

    // 2. INTENTO DE DECODIFICACIÓN
    try {
        if (!process.env.JWT_SECRET) throw new Error("Falta JWT_SECRET en .env");

        const decoded = jwt.verify(tokenRecibido, process.env.JWT_SECRET);
        materiaId = decoded.materiaId;
        console.log(`✅ Token JWT válido. Materia ID detectada: ${materiaId}`);

    } catch (err) {
        console.log(`⚠️ Falló verificación JWT: ${err.message}`);

        if (!isNaN(tokenRecibido)) {
            materiaId = tokenRecibido;
            console.log(`ℹ️ Detectado como ID manual: ${materiaId}`);
        } else {
             return res.status(400).json({ message: "Código QR inválido o expirado." });
        }
    }

    if (!materiaId) {
        return res.status(400).json({ message: "No se pudo leer la materia." });
    }

    // VERIFICAR MATRÍCULA
     // Buscamos si existe una matrícula para este alumno en esta materia
    const estaMatriculado = await Matricula.findOne({
        where: {
            estudianteId: usuarioId, 
            materiaId: materiaId
        }
    });

    if (!estaMatriculado) {
        console.log(`Usuario ${usuarioId} intentó registrarse en materia ${materiaId} sin estar matriculado.`);
        return res.status(403).json({ message: "⛔ No estás matriculado en esta materia." });
    }
    // 3. VERIFICAR DUPLICADOS (Si ya marcó hoy)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const asistenciaExistente = await Asistencia.findOne({
      where: {
        usuarioId: usuarioId,
        materiaId: materiaId,
        createdAt: { [Op.between]: [startOfDay, endOfDay] }
      }
    });

    if (asistenciaExistente) {
      return res.status(409).json({ message: "⚠️ Ya registraste tu asistencia hoy." });
    }

    // 4. CREAR REGISTRO
    const nuevaAsistencia = await Asistencia.create({
      usuarioId: usuarioId,
      materiaId: materiaId,
      estado: 'presente',
      fecha: new Date(),
      hora_registro: new Date().toTimeString().split(' ')[0] //Usamos toTimeString para asegurar formato militar (HH:MM:SS) compatible con MySQL
    });

    // 5. OBTENER DATOS COMPLETOS PARA SOCKET
    const asistenciaCompleta = await Asistencia.findOne({
        where: { id: nuevaAsistencia.id },
        include: [{ 
            model: Usuario, 
            attributes: ["nombre", "email", "cedula"] 
        }]
    });

    // 6. EMITIR SOCKET EN TIEMPO REAL
    const io = req.app.get('socketio');
    if(io) {
        io.to(`curso_${materiaId}`).emit('nueva-asistencia', asistenciaCompleta);
    }

    res.status(201).json({ 
        message: "✅ Asistencia registrada correctamente", 
        data: asistenciaCompleta 
    });

  } catch (error) {
    console.error("❌ Error CRÍTICO en registro:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.obtenerReporteDiario = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDia = new Date(hoy.setHours(23, 59, 59, 999));

    const asistencias = await Asistencia.findAll({
      where: { createdAt: { [Op.between]: [inicioDia, finDia] } },
      include: [{ model: Usuario, attributes: ["nombre", "email", "rol"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(asistencias);
  } catch (error) {
    res.status(500).json({ message: "Error al generar reporte" });
  }
};

exports.obtenerHistorial = async (req, res) => {
  try {
    // Consulta SQL para agrupar por fecha y contar asistentes
    // Devuelve: [ { fecha: '2023-10-20', total: 15 }, ... ]
    const historial = await Asistencia.findAll({
      attributes: [
        "fecha",
        [sequelize.fn("COUNT", sequelize.col("id")), "total_asistentes"],
      ],
      group: ["fecha"],
      order: [["fecha", "DESC"]],
    });
    res.json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
};

exports.obtenerAsistenciasDeHoy = async (req, res) => {
  try {
    const { materiaId } = req.query;

    if (!materiaId) {
        return res.status(400).json({ message: "Falta el ID de la materia" });
    }

    // Definir inicio y fin del día usando createdAt
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const asistencias = await Asistencia.findAll({
      where: {
        materiaId: materiaId,
        createdAt: { [Op.between]: [startOfDay, endOfDay] }
      },
      include: [
        {
          model: Usuario,  // a partir del modelo se debe buscar los atributos
          
          attributes: ['id', 'nombre', 'email', 'cedula'], 
          required: true 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Contamos matriculados para evitar errores en las tarjetas del dashboard
    // Aseguramos que el modelo Matricula esté importado arriba
    const totalMatriculados = await Matricula.count({
        where: { materiaId: materiaId }
    });

    // Enviamos el objeto con la estructura que tu Dashboard.jsx espera: res.data.asistencias
    res.json({ 
        asistencias, 
        totalMatriculados 
    });

  } catch (error) {
    console.error("❌ Error al obtener asistencias:", error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
};

exports.generarQrMateria = async (req, res) => {
    try {
        const { materiaId } = req.body;
        if (!materiaId) return res.status(400).json({ message: "Falta materiaId" });

        // VERIFICACIÓN DE SEGURIDAD
        if (!process.env.JWT_SECRET) {
            console.error("⛔ ERROR GRAVE: No se cargó JWT_SECRET del archivo .env");
            return res.status(500).json({ message: "Error de configuración del servidor" });
        }

        const token = jwt.sign(
            { 
                materiaId: String(materiaId), // Lo convertimos a String para evitar dudas
                random: Math.random() 
            }, 
            process.env.JWT_SECRET, // Solo usamos la variable de entorno
            { expiresIn: '60s' } 
        );

        res.json({ token });
    } catch (error) {
        console.error("Error generando QR:", error);
        res.status(500).json({ message: "Error interno" });
    }
};

exports.eliminarAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        await Asistencia.destroy({ where: { id } });
        res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar" });
    }
};

// REPORTES
exports.obtenerReporteMateria = async (req, res) => {
    const { materiaId } = req.params;

    try {
        const materia = await Materia.findByPk(materiaId, {
            include: [{ 
                model: Usuario, 
                as: 'profesor', 
                attributes: ['nombre'] 
            }]
        });

        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

        const asistencias = await Asistencia.findAll({
            where: { materiaId },
            include: [{ 
                model: Usuario, 
                attributes: ['id', 'nombre', 'cedula'] 
            }],
            order: [['fecha', 'ASC'], ['hora_registro', 'ASC']]
        });

        res.json({
            materia: materia,
            asistencias: asistencias
        });

    } catch (error) {
        console.error("Error al generar reporte:", error);
        res.status(500).json({ message: "Error al obtener datos del reporte" });
    }
};
// src/controllers/matriculaController.js
const { Usuario, Matricula } = require('../models');
const XLSX = require('xlsx');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

// Vincular un solo alumno (Por CÉDULA)
exports.vincularAlumno = async (req, res) => {
  const { cedula, materiaId } = req.body;

  try {
    // Buscar al alumno por cédula
    const alumno = await Usuario.findOne({ where: { cedula, rol: 'estudiante' } });

    if (!alumno) {
      return res.status(404).json({ message: 'Estudiante no encontrado con esa cédula' });
    }

    // Verificar si ya está matriculado
    const existe = await Matricula.findOne({
      where: { estudianteId: alumno.id, materiaId }
    });

    if (existe) {
      return res.status(400).json({ message: 'El estudiante ya está matriculado en esta materia' });
    }

    // Crear matrícula
    await Matricula.create({
      estudianteId: alumno.id,
      materiaId,
      // periodo dinámico basado en fecha actual
      periodo: `${new Date().getFullYear()}-${Math.floor((new Date().getMonth() + 1) / 6) + 1}`

    });

    res.json({ message: 'Alumno vinculado exitosamente', alumno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al vincular alumno' });
  }
};

// Desmatricular
exports.desmatricular = async (req, res) => {
  const { estudianteId, materiaId } = req.params;

  try {
    const eliminado = await Matricula.destroy({
      where: { estudianteId, materiaId }
    });

    if (!eliminado) {
      return res.status(404).json({ message: 'Matrícula no encontrada' });
    }

    res.json({ message: 'Alumno desvinculado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al desvincular' });
  }
};

// Carga Masiva desde Excel (Solo Admin)
exports.cargaMasiva = async (req, res) => {
  const t = await sequelize.transaction(); 
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const materiaId = req.body.materiaId; 
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    let creados = 0;
    let vinculados = 0;
    let errores = 0;

    for (const row of data) {
      // Validar datos mínimos
      if (!row.cedula || !row.email) {
        errores++;
        continue;
      }

      const cedula = row.cedula.toString();
      const email = row.email.trim();
      const nombre = row.nombre || 'Sin Nombre';
      const apellido = row.apellido || 'Sin Apellido';

      try {
        // 1. Buscar o Crear Usuario (Estudiante)
        let alumno = await Usuario.findOne({ where: { cedula } });

        if (!alumno) {
          // Crear hash de contraseña (usamos la cédula como pass inicial)
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(cedula, salt);

          alumno = await Usuario.create({
            nombre: `${nombre} ${apellido}`, // O separa campos según tu modelo
            email: email,
            cedula: cedula,
            password: passwordHash,
            rol: 'estudiante'
          }, { transaction: t });
          creados++;
        }

        // 2. Matricular en la materia (Si no está matriculado ya)
        const matriculaExistente = await Matricula.findOne({ 
            where: { estudianteId: alumno.id, materiaId } 
        });

        if (!matriculaExistente) {
           await Matricula.create({ 
               estudianteId: alumno.id, 
               materiaId, 
               periodo: '2026-1' // Esto podrías recibirlo del body también
           }, { transaction: t });
           vinculados++;
        }

      } catch (err) {
        console.error(`Error con cédula ${cedula}:`, err);
        errores++;
      }
    }

    await t.commit(); // Guardar cambios en DB
    fs.unlinkSync(req.file.path); // Borrar archivo temp

    res.json({ 
      message: `Proceso finalizado.`,
      detalles: {
        nuevosUsuariosCreados: creados,
        totalMatriculados: vinculados,
        errores: errores
      }
    });

  } catch (error) {
    await t.rollback(); // Si falla algo grave, deshacer todo
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error procesando el archivo Excel' });
  }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, cedula } = req.body;

    try {
        const alumno = await Usuario.findByPk(id);

        if (!alumno) {
            return res.status(404).json({ message: "Alumno no encontrado" });
        }

        // Verificar que el nuevo email o cédula no pertenezca a otro usuario
        
        alumno.nombre = nombre || alumno.nombre;
        alumno.email = email || alumno.email;
        alumno.cedula = cedula || alumno.cedula;

        await alumno.save();

        res.json({ message: "Alumno actualizado correctamente", alumno });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar alumno" });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const alumno = await Usuario.findOne({ where: { id, rol: 'estudiante' } });

        if (!alumno) {
            return res.status(404).json({ message: "Alumno no encontrado" });
        }

        // OPCIÓN 1: Borrado Físico (Cascada manual si no está configurada en BD)
        // Primero borramos sus asistencias y matrículas
        await Matricula.destroy({ where: { estudianteId: id } });
        // await Asistencia.destroy({ where: { estudianteId: id } }); // Si tienes tabla asistencia
        
        // Finalmente borramos al usuario
        await alumno.destroy();

        res.json({ message: "Alumno eliminado del sistema permanentemente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar alumno" });
    }
};
// src/controllers/matriculaController.js
const { Usuario, Matricula, Materia } = require('../models');
const { Op } = require("sequelize");
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

// Carga Masiva desde Excel
exports.cargaMasiva = async (req, res) => {
       try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        const materiaId = req.body.materiaId;
        
        // Validar que la materia exista
        const materia = await Materia.findByPk(materiaId);
        if(!materia) {
             fs.unlinkSync(req.file.path);
             return res.status(404).json({ message: 'La materia seleccionada no existe.' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let stats = {
            procesados: 0,
            creados: 0,
            existentes: 0,
            matriculados: 0,
            errores: []
        };

        for (const row of data) {
            stats.procesados++;
            
            // 1. Limpieza y Validación básica de datos
            // Aseguramos que cédula sea string y email minúsculas
            const cedula = row.cedula ? String(row.cedula).trim() : null;
            const email = row.email ? String(row.email).trim().toLowerCase() : null;
            const nombre = row.nombre ? row.nombre.trim() : 'Sin Nombre';
            const apellido = row.apellido ? row.apellido.trim() : '';
            const nombreCompleto = `${nombre} ${apellido}`.trim();

            if (!cedula || !email) {
                stats.errores.push(`Fila ${stats.procesados}: Falta cédula o email.`);
                continue;
            }

            try {
                // 2. BUSCAR USUARIO EXISTENTE (Por Cédula O Email)
                // Esto evita el error de "Duplicate entry"
                let alumno = await Usuario.findOne({
                    where: {
                        [Op.or]: [
                            { cedula: cedula },
                            { email: email }
                        ]
                    }
                });

                if (alumno) {
                    stats.existentes++;                 
                    // Caso borde: El email existe pero con otra cédula (o viceversa)
                    if (alumno.cedula !== cedula) {
                        stats.errores.push(`Conflicto: El email ${email} ya pertenece al usuario con cédula ${alumno.cedula}. No se puede registrar cédula ${cedula}.`);
                        continue; 
                    }
                } else {
                    // 3. CREAR NUEVO USUARIO
                    const salt = await bcrypt.genSalt(10);
                    // Contraseña por defecto: La misma cédula
                    const passwordHash = await bcrypt.hash(cedula, salt);

                    alumno = await Usuario.create({
                        nombre: nombreCompleto,
                        email: email,
                        cedula: cedula,
                        password: passwordHash,
                        rol: 'estudiante'
                    });
                    stats.creados++;
                }

                // 4. MATRICULAR EN LA MATERIA (Si no está ya matriculado)
                const [matricula, created] = await Matricula.findOrCreate({
                    where: { 
                        estudianteId: alumno.id, 
                        materiaId: materiaId 
                    },
                    defaults: {
                        periodo: '2026-1' // O dinámico según fecha
                    }
                });

                if (created) {
                    stats.matriculados++;
                }

            } catch (err) {
                console.error(`Error procesando alumno ${cedula}:`, err);
                stats.errores.push(`Cédula ${cedula}: ${err.message}`);
            }
        }

        // Limpiar archivo temporal
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        // 5. RESPUESTA INTELIGENTE
        // Construimos un mensaje resumen
        let mensaje = "Proceso finalizado.";
        if (stats.errores.length > 0) {
            mensaje += " Algunos registros tuvieron problemas.";
        } else {
            mensaje += " Todos los alumnos fueron procesados correctamente.";
        }

        res.json({
            message: mensaje,
            detalles: {
                total: stats.procesados,
                nuevos: stats.creados,
                encontrados: stats.existentes,
                matriculadosAhora: stats.matriculados,
                fallidos: stats.errores.length,
                listaErrores: stats.errores 
            }
        });

    } catch (error) {
        console.error("Error general en carga masiva:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error crítico en el servidor procesando el archivo.' });
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
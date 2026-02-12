const { Matricula, Usuario } = require("../models");

exports.obtenerAlumnosPorMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;

    console.log(`Buscando alumnos para materia ID: ${materiaId}`);

    const inscripciones = await Matricula.findAll({
      where: { materiaId: materiaId },
      include: [
        {
          model: Usuario,
          attributes: ["id", "nombre", "cedula", "email"],
        },
      ],
    });

    // Al quitar el alias, Sequelize devuelve el objeto dentro de "Usuario" 
    const alumnos = inscripciones
      .map((inscripcion) => {
        // Verificamos si existe el usuario antes de devolverlo
        if (inscripcion.Usuario) {
          return inscripcion.Usuario;
        }
        return null;
      })
      .filter((a) => a !== null); // Filtramos 

    console.log(`✅ Encontrados ${alumnos.length} alumnos.`);
    res.json(alumnos);
  } catch (error) {
    console.error("❌ Error CRÍTICO en obtenerAlumnosPorMateria:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// Eliminar un alumno SOLO de una materia específica
exports.desmatricularAlumno = async (req, res) => {
    try {
        const { materiaId, estudianteId } = req.params;

        // Borramos la relación en la tabla Matricula
        const resultado = await Matricula.destroy({
            where: {
                materiaId: materiaId,
                estudianteId: estudianteId
            }
        });

        if (resultado) {
            res.json({ message: "Alumno desmatriculado correctamente" });
        } else {
            res.status(404).json({ message: "No se encontró la matrícula" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al desmatricular" });
    }
};
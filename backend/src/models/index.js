const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Materia = require('./Materia');
const Asistencia = require('./Asistencia');
const Matricula = require('./Matricula');

// Relaciones
// Un profesor tiene muchas materias, una materia pertenece a un profesor
Usuario.hasMany(Materia, { foreignKey: 'profesorId', as: 'materiasDictadas' });
Materia.belongsTo(Usuario, { foreignKey: 'profesorId', as: 'profesor' });

// Un usuario tiene muchas asistencias, una materia tiene muchas asistencias
Usuario.hasMany(Asistencia, { foreignKey: 'usuarioId' });
Asistencia.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Materia.hasMany(Asistencia, { foreignKey: 'materiaId' });
Asistencia.belongsTo(Materia, { foreignKey: 'materiaId' });

// MATRÍCULAS (Relación Muchos a Muchos entre Estudiantes y Materias)
// Un estudiante puede estar en muchas materias
Usuario.belongsToMany(Materia, { 
    through: Matricula, 
    foreignKey: 'estudianteId', 
    otherKey: 'materiaId',
    as: 'materiasMatriculadas' 
});

// Una materia tiene muchos estudiantes
Materia.belongsToMany(Usuario, { 
    through: Matricula, 
    foreignKey: 'materiaId', 
    otherKey: 'estudianteId',
    as: 'estudiantesInscritos' // Alias para cuando consultemos desde el lado de la materia
});
// Relación: Una Matrícula pertenece a un Estudiante (Usuario)
Matricula.belongsTo(Usuario, { 
    foreignKey: 'estudianteId', 
    targetKey: 'id'
});

// Relación: Una Matrícula pertenece a una Materia
Matricula.belongsTo(Materia, { 
    foreignKey: 'materiaId', 
    targetKey: 'id'
});
// --- EXPORTAR TODO ---
module.exports = {
    sequelize,
    Usuario,
    Materia,
    Asistencia,
    Matricula 
};
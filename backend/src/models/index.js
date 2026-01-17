const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const Materia = require('./Materia');
const Asistencia = require('./Asistencia');

// Definir Relaciones
// 1. Un profesor puede tener muchas materias
Usuario.hasMany(Materia, { foreignKey: 'profesorId', as: 'materias' });
Materia.belongsTo(Usuario, { foreignKey: 'profesorId', as: 'profesor' });

// 2. Relación Asistencia
// Una asistencia pertenece a un Estudiante
Asistencia.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'estudiante' });
Usuario.hasMany(Asistencia, { foreignKey: 'usuarioId' });

// Una asistencia pertenece a una Materia
Asistencia.belongsTo(Materia, { foreignKey: 'materiaId', as: 'materia' });
Materia.hasMany(Asistencia, { foreignKey: 'materiaId' });

module.exports = {
  sequelize,
  Usuario,
  Materia,
  Asistencia
};
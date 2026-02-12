// backend/src/models/Matricula.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Matricula = sequelize.define('Matricula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: false
  },
    estudianteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios', 
      key: 'id'
    }
  },
  materiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Materias',
      key: 'id'
    }
  }
}, {
  tableName: 'Matriculas', // Asegura el nombre de la tabla
  timestamps: true
});

module.exports = Matricula;
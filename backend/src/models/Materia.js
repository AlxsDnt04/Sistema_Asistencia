const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Materia = sequelize.define('Materia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: { // ej'LAB-101'
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
});

module.exports = Materia;
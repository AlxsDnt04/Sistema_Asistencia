const { DataTypes } = require('sequelize');
const  sequelize  = require('../config/database');

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY, // Solo guarda en formate fecha
    defaultValue: DataTypes.NOW
  },
  hora_registro: {
    type: DataTypes.TIME, // Guarda la hora exacta del escaneo
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('presente', 'retardo', 'falta'),
    defaultValue: 'presente'
  }
});

module.exports = Asistencia;
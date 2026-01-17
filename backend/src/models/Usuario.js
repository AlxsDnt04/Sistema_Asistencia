const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: { // email para el login
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('profesor', 'estudiante'),
    defaultValue: 'estudiante'
  },
  device_id: { // Para la seguridad extra
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = Usuario;
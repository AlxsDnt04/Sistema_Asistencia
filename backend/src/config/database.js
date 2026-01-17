const { Sequelize } = require('sequelize');

// Configuración para Laragon (Usuario: root, Pass: vacío)
const sequelize = new Sequelize('asistencia_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, 
});

const verificarConexion = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa.');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  }
};

module.exports = { sequelize, verificarConexion };
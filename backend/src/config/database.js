// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); 

// Configuración de la conexión a MySQL
const sequelize = new Sequelize(
    'asistencia_db', // Nombre de base de datos
    'root',          // Usuario (por defecto en Laragon es 'root')
    '',              // Contraseña (por defecto en Laragon es vacía)
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: false, 
        timezone: '-05:00', 
    }
);

// Probar la conexión (Opcional, ayuda a depurar)
sequelize.authenticate()
    .then(() => console.log('✔ Conexión a MySQL establecida.'))
    .catch(err => console.error('❗ Error de conexión a MySQL:', err));

// IMPORTANTE: Exportamos la instancia DIRECTAMENTE
module.exports = sequelize;
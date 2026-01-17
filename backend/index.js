const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = 3000; // El puerto donde escuchará el servidor

// Middlewares (Para que el servidor entienda JSON y acepte peticiones del celular)
app.use(cors());
app.use(express.json());

// usar rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Servidor funcionando correctamente!' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  try{
  await sequelize.sync({force: false});
  console.log('Tablas sincronizadas correctamente.');
  }catch(error){
    console.error('Error al sincronizar tablas:', error);}
});
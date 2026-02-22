const express = require('express'); // ayuda a crear el servidor y manejar rutas
const http = require('http'); // para crear un servidor HTTP que Socket.IO pueda usar
const socketIo = require('socket.io'); // para comunicación en tiempo real entre el backend y el frontend
const cors = require('cors'); // para permitir solicitudes desde el frontend (React) que corre en otro puerto
const db = require('./src/config/database'); // Importar modelos para asegurar que las relaciones estén definidas
const authRoutes = require('./src/routes/authRoutes'); // Rutas
const asistenciaRoutes = require('./src/routes/asistenciaRoutes'); 
const materiaRoutes = require('./src/routes/materiaRoutes');
const alumnoRoutes = require('./src/routes/alumnoRoutes');
const matriculaRoutes = require('./src/routes/matriculaRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');

// Inicializar App
const app = express(); 
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
// Compartir 'io' para que el controlador pueda usarlo
app.set('socketio', io);
// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/asistencia', asistenciaRoutes); 
app.use('/api/materias', materiaRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/matricula', matriculaRoutes);
// el socket permite comunicación en tiempo real entre el backend y el frontend
io.on('connection', (socket) => {
    console.log('⚡ Cliente conectado ID:', socket.id);

    // Permitir al frontend unirse a una sala
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Cliente ${socket.id} se unió a la sala: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


const PORT = 3000;
db.sync().then(() => {
    server.listen(PORT, () => {
        console.log(`✔ Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => console.log('Error BD:', err));
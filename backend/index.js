const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const db = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
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
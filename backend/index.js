const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const db = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const asistenciaRoutes = require('./src/routes/asistenciaRoutes'); 

// Inicializar App
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
// 2. USAR LA RUTA DE ASISTENCIA
app.use('/api/asistencia', asistenciaRoutes); 

// --- LÓGICA DEL QR ---
let currentQR = ''; 

const generarQR = () => {
    // 3. 2m (120s) PARA EVITAR ERRORES DE TIEMPO
    const token = jwt.sign(
        { timestamp: new Date().getTime() }, 
        'TU_SECRETO_SUPER_SEGURO', 
        { expiresIn: '2m' } 
    );
    
    currentQR = token; 
    io.emit('qr-code', currentQR); 
    console.log('🔄 Nuevo QR generado');
};

generarQR();
setInterval(generarQR, 10000); // El dibujo cambia cada 10s, pero el token vale por 2m

// Compartir 'io' para que el controlador pueda usarlo
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('⚡ Cliente conectado ID:', socket.id);
    if (currentQR) {
        socket.emit('qr-code', currentQR);
    }
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
// backend/src/middlewares/authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Obtener "Authorization"
    const authHeader = req.headers['authorization'];
    
    // Verificar que exista
    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    // Limpiar el token (quitar la palabra "Bearer " si viene)
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

    try {
        // Verificar el token con la MISMA clave secreta que usas al crearlo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // INYECTAR LOS DATOS EN LA PETICIÓN
        req.user = decoded; 
        
        console.log('🔑 Middleware: Usuario autenticado ID:', req.user.id);
        
        next(); // Pasar al controlador
    } catch (error) {
        console.error('❌ Error en middleware auth:', error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};
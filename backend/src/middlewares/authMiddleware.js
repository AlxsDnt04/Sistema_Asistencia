// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Obtener el header "Authorization"
    const authHeader = req.headers['authorization'];
    
    // 2. Verificar que exista
    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    // 3. Limpiar el token (quitar la palabra "Bearer " si viene)
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

    try {
        // 4. Verificar el token con la MISMA clave secreta que usas al crearlo
        const decoded = jwt.verify(token, 'TU_SECRETO_SUPER_SEGURO');
        
        // 5. INYECTAR LOS DATOS EN LA PETICIÓN
        // Aquí es donde fallaba antes: no se estaba creando req.user
        req.user = decoded; 
        
        console.log('🔑 Middleware: Usuario autenticado ID:', req.user.id);
        
        next(); // Pasar al controlador
    } catch (error) {
        console.error('❌ Error en middleware auth:', error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};
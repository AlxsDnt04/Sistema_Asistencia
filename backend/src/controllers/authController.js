const { Usuario } = require('../models');// importa carpeta modelos
const bcrypt = require('bcrypt');// Para comparar contraseñas
const jwt = require('jsonwebtoken');// Para generar tokens

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar Token (JWT)
    // Este token es que usará la app para hablar con el servidor
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      'SECRETO_SUPER_SECRETO', // En un proyecto real, esto va en .env
      { expiresIn: '12h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
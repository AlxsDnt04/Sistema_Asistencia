const { Usuario } = require("../models"); // carpeta modelos
const bcrypt = require("bcrypt"); // Para comparar contraseñas
const jwt = require("jsonwebtoken"); // Para generar tokens

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Generar Token (JWT)
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      "mi_clave_secreta_super_segura_123", // La misma clave que en el middleware
      { expiresIn: "12h" },
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

exports.obtenerAlumnos = async (req, res) => {
    try {
        console.log("Consultando alumnos en la BD...");

        const alumnos = await Usuario.findAll({
            where: { rol: 'estudiante' }, 
            attributes: ['id', 'nombre', 'email', 'rol'] 
        });

        console.log(`Encontrados ${alumnos.length} alumnos.`);
        res.json(alumnos);
    } catch (error) {
        console.error("Error  en obtenerAlumnos:", error); 
        res.status(500).json({ message: 'Error interno del servidor al obtener alumnos' });
    }
};


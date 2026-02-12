// src/controllers/usuarioController.js
const { Usuario } = require("../models"); 
const bcrypt = require('bcryptjs');

exports.getUsuarios = async (req, res) => {
    try {
        console.log("🔍 Buscando lista de usuarios...");

        const usuarios = await Usuario.findAll({
            attributes: ["id", "nombre", "email", "rol"], 
            where: {
                 rol: ['docente', 'profesor', 'admin'] 
            }
        });

        console.log(`✅ Encontrados ${usuarios.length} usuarios.`);
        res.json(usuarios);

    } catch (error) {
        console.error("❌ Error en getUsuarios:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
};

exports.createUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, cedula } = req.body;

        // Validaciones básicas
        if (!cedula) return res.status(400).json({ message: "La cédula es obligatoria" });

        const existe = await Usuario.findOne({ where: { email } });
        if (existe) return res.status(400).json({ message: "El email ya está registrado" });

        // Validar si la cédula ya existe
        const cedulaExiste = await Usuario.findOne({ where: { cedula } });
        if (cedulaExiste) return res.status(400).json({ message: "La cédula ya está registrada" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await Usuario.create({
            nombre,
            email,
            cedula, 
            password: hashedPassword,
            rol: rol || 'profesor'
        });

        res.json({ message: "Usuario creado correctamente" });
    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
        res.status(500).json({ message: "Error al crear usuario", error: error.message });
    }
};

exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol, password, cedula } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

        const datosActualizar = { nombre, email, rol, cedula }; 

        if (password && password.trim() !== "") {
            datosActualizar.password = await bcrypt.hash(password, 10);
        }

        await usuario.update(datosActualizar);
        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar:", error);
        res.status(500).json({ message: "Error al actualizar" });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Usuario.destroy({ where: { id } });

        if (eliminado) {
            res.json({ message: "Usuario eliminado correctamente" });
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("❌ Error al eliminar:", error);
        res.status(500).json({ message: "No se puede eliminar (posiblemente tenga materias o asistencias asociadas)" });
    }
};
// src/controllers/usuarioController.js
const { Usuario } = require("../models"); 

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
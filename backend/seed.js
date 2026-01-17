// inserta datos de prueba (solo ejecuta una vez)
const { sequelize, Usuario, Materia } = require('./src/models');
const bcrypt = require('bcrypt');

const sembrarDatos = async () => {
  try {
    await sequelize.sync({ force: true }); // BORRA Y CREA LAS TABLAS DE CERO

    // 1. Crear Profesor
    const passwordProfesor = await bcrypt.hash('admin123', 10);
    const profesor = await Usuario.create({
      nombre: 'Ing. Carlos Docente',
      email: 'profe@test.com',
      password: passwordProfesor,
      rol: 'profesor'
    });

    // 2. Crear Estudiante
    const passwordEstudiante = await bcrypt.hash('alumno123', 10);
    const estudiante = await Usuario.create({
      nombre: 'Juan Perez',
      email: 'juan@test.com',
      password: passwordEstudiante,
      rol: 'estudiante',
      device_id: 'celular-juan-001'
    });

    // 3. Crear Materia
    await Materia.create({
      nombre: 'Laboratorio de Química I',
      codigo: 'QUI-101',
      profesorId: profesor.id // Asignar el profesor creado
    });

    console.log('Datos de prueba insertados correctamente');
    process.exit();
  } catch (error) {
    console.error('Error al sembrar datos:', error);
    process.exit(1);
  }
};

sembrarDatos();
const { sequelize, Usuario, Materia } = require('./src/models');
const bcrypt = require('bcrypt');

const sembrarDatos = async () => {
  try {
    // BORRA Y RECREA TODA LA BASE DE DATOS
    await sequelize.sync({ force: true });
    console.log('🔄 Base de datos limpiada y sincronizada.');

    // 1. Crear Profesor
    const passwordProfesor = await bcrypt.hash('admin123', 10);
    const profesor = await Usuario.create({
      nombre: 'Ing. Carlos Docente',
      email: 'profe@test.com',
      password: passwordProfesor,
      rol: 'profesor'
    });
    console.log('✅ Profesor creado: profe@test.com');

    // 2. Crear Materias 
    const materias = await Materia.bulkCreate([
      { nombre: 'Base de Datos I', codigo: 'BD-101', profesorId: profesor.id },
      { nombre: 'Ingeniería de Software', codigo: 'IS-202', profesorId: profesor.id },
      { nombre: 'Programación Web', codigo: 'WEB-303', profesorId: profesor.id }
    ]);
    console.log('✅ 3 Materias creadas.');

    // 3. Crear Estudiantes
    const passwordEstudiante = await bcrypt.hash('alumno123', 10);
    
    // Array de estudiantes
    const estudiantesData = [
      { nombre: 'Juan Perez', email: 'juan@test.com', rol: 'estudiante', device_id: 'dev-001' },
      { nombre: 'Maria Gomez', email: 'maria@test.com', rol: 'estudiante', device_id: 'dev-002' },
      { nombre: 'Luis Torres', email: 'luis@test.com', rol: 'estudiante', device_id: 'dev-003' },
      { nombre: 'Ana Rivas', email: 'ana@test.com', rol: 'estudiante', device_id: null },
      { nombre: 'Carlos Ruiz', email: 'carlos@test.com', rol: 'estudiante', device_id: null }
    ];

    // Agregamos la contraseña encriptada a cada uno
    const estudiantesConPass = estudiantesData.map(est => ({
      ...est,
      password: passwordEstudiante
    }));

    await Usuario.bulkCreate(estudiantesConPass);
    console.log(`✅ ${estudiantesData.length} Estudiantes creados.`);

    console.log('🚀 ¡Semilla completada con éxito!');
    process.exit();
  } catch (error) {
    console.error('❌ Error fatal al sembrar datos:', error);
    process.exit(1);
  }
};

sembrarDatos();
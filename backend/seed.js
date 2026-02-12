// seed.js
const { sequelize, Usuario, Materia, Matricula } = require('./src/models'); // Ajusta la ruta si es necesario
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // 1. REINICIO NUCLEAR: Borra todas las tablas y las crea de nuevo con la nueva estructura (incluyendo la columna 'cedula')
    await sequelize.sync({ force: true });
    console.log('--- Tablas recreadas correctamente (Base de datos limpia) ---');

    // 2. Hash genérico para todos (password: 123456)
    const passwordHash = await bcrypt.hash('123456', 10);

    // 3. Crear ADMIN
    await Usuario.create({
      nombre: 'Admin General',
      email: 'admin@test.com',
      password: passwordHash,
      cedula: '1700000000',
      rol: 'admin'
    });
    console.log('✅ Admin creado');

    // 4. Crear PROFESORES
    const profe1 = await Usuario.create({
      nombre: 'Ing. Carlos Docente',
      email: 'profe1@test.com',
      password: passwordHash,
      cedula: '1711111111',
      rol: 'profesor'
    });

    const profe2 = await Usuario.create({
      nombre: 'Lic. Laura Educadora',
      email: 'profe2@test.com',
      password: passwordHash,
      cedula: '1722222222',
      rol: 'profesor'
    });
    console.log('✅ Profesores creados');

    // 5. Crear ALUMNOS
    const alumnosData = [
      { nombre: 'Ana Martinez', email: 'ana@test.com', cedula: '1750000001' },
      { nombre: 'Luis Perez', email: 'luis@test.com', cedula: '1750000002' },
      { nombre: 'Sofia Ramirez', email: 'sofia@test.com', cedula: '1750000003' },
      { nombre: 'Jorge Gomez', email: 'jorge@test.com', cedula: '1750000004' },
      { nombre: 'Maria Torres', email: 'maria@test.com', cedula: '1750000005' },
    ];

    // Usamos Promise.all para crearlos en paralelo
    const alumnos = await Promise.all(
      alumnosData.map(alumno => 
        Usuario.create({
          ...alumno,
          password: passwordHash,
          rol: 'estudiante'
        })
      )
    );
    console.log('✅ Alumnos creados');

    // 6. Crear MATERIAS (Asignadas a los profesores)
    // Materias del Profe 1
    const materia1 = await Materia.create({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT-101',
      profesorId: profe1.id
    });

    const materia2 = await Materia.create({
      nombre: 'Física I',
      codigo: 'FIS-101',
      profesorId: profe1.id
    });

    // Materias del Profe 2
    const materia3 = await Materia.create({
      nombre: 'Programación Web',
      codigo: 'WEB-101',
      profesorId: profe2.id
    });
    console.log('✅ Materias creadas');

    // 7. MATRICULAR ALUMNOS (Llenar la tabla intermedia)
    // Matriculamos a Ana, Luis y Sofia en Matemáticas
    await Matricula.bulkCreate([
      { estudianteId: alumnos[0].id, materiaId: materia1.id, periodo: '2026-1' }, // Ana
      { estudianteId: alumnos[1].id, materiaId: materia1.id, periodo: '2026-1' }, // Luis
      { estudianteId: alumnos[2].id, materiaId: materia1.id, periodo: '2026-1' }, // Sofia
    ]);

    // Matriculamos a Jorge y Maria en Programación
    await Matricula.bulkCreate([
      { estudianteId: alumnos[3].id, materiaId: materia3.id, periodo: '2026-1' }, // Jorge
      { estudianteId: alumnos[4].id, materiaId: materia3.id, periodo: '2026-1' }, // Maria
    ]);

    console.log('✅ Matrículas creadas');
    console.log('🚀 --- SEED FINALIZADO CON ÉXITO --- 🚀');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
    process.exit(1);
  }
};

seedDatabase();
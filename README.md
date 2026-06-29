# Sistema de Asistencia

Una plataforma para gestionar la asistencia académica con:
- una API backend en Node.js,
- una aplicación móvil (React Native / Expo),
- un panel web administrativo (Vite + React + Tailwind).

Resumen: registra usuarios/estudiantes (matrículas), materias y asistencias; soporta uploads y trae un script para poblar datos de ejemplo.

---

## Contenido del repositorio

- `backend/`       — API REST (controladores, modelos, rutas, uploads)
- `mobile-app/`    — App móvil (App.js, src/screens, src/services)
- `web-admin/`     — Panel administrativo (index.html, src/, Vite + Tailwind)

---

## Stack
- Lenguaje(s): JavaScript
- Backend: Node.js
- Frontend móvil: React Native / Expo (sugerido por app.json)
- Panel web: Vite + React + Tailwind
- Notables: estructuras de modelos en `backend/src/models`, scripts de seed (`backend/seed.js`)

## Cómo está organizado (árbol principal)

```
backend/
  index.js                     # punto de entrada de la API
  package.json
  .env                         # variables de entorno (NO subir credenciales)
  seed.js                      # script para poblar datos de ejemplo
  src/
    controllers/               # lógica de endpoints (alumnoController.js, authController.js, etc.)
    models/                    # definiciones de modelos (Asistencia.js, Materia.js, Matricula.js, Usuario.js, index.js)
    routes/                    # mapeo de rutas hacia controladores
    middlewares/               # middlewares (auth, manejo errores, etc.)
  uploads/                      # carpeta para ficheros subidos

mobile-app/
  App.js                       # entrada de la app móvil
  app.json
  package.json
  src/
    screens/                   # pantallas
    services/                  # llamadas al backend / utilidades

web-admin/
  index.html
  src/                         # código del panel admin
  public/
  package.json
  vite.config.js
  tailwind.config.js
```

Cómo encaja: la app móvil y el panel admin consumen la API REST en `backend/index.js`. Los modelos en `backend/src/models` representan las entidades principales (usuarios, matrículas, materias, asistencias). `seed.js` sirve para desarrollo.

## Cómo ejecutar (rápido)

Requisitos: Node.js (LTS recomendado), npm o yarn. Para la app móvil: Expo CLI si aplica.

Backend
```bash
cd backend
npm install
# Crear/llenar backend/.env con las variables necesarias (ver sección "Variables de entorno")
node seed.js   # opcional: poblar datos de ejemplo
node index.js  # o: npm start / npm run dev si están definidos
```

Mobile (desarrollo)
```bash
cd mobile-app
npm install
npm start    # expo start si usa Expo
```

Web admin (desarrollo)
```bash
cd web-admin
npm install
npm run dev
npm run build   # para build de producción
```

## Variables de entorno (ejemplo)
Cree `backend/.env` con las variables necesarias. Ejemplo:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=<cadena_de_conexion>
JWT_SECRET=<clave_secreta_para_tokens>
```

Revise `backend/src/models/index.js` y `backend/index.js` para confirmar los nombres exactos.

## Seeds / Datos de ejemplo
`backend/seed.js` inserta datos de prueba (usuarios, materias, matrículas, asistencias). Asegúrese de que la base de datos esté accesible y ejecute:

```bash
node seed.js
```

## Endpoints (basado en controladores)
- /auth         — autenticación (authController.js)
- /alumnos      — operaciones sobre alumnos (alumnoController.js)
- /usuarios     — gestión de usuarios (usuarioController.js)
- /materias     — gestión de materias (materiaController.js)
- /matriculas   — matrícula/inscripciones (matriculaController.js)
- /asistencias  — registro/consulta de asistencias (asistenciaController.js)

Compruebe `backend/src/routes` para verbos y rutas exactas.

## Consideraciones importantes
- Seguridad:
  - No subir `.env` con credenciales.
  - Usar un JWT_SECRET fuerte y HTTPS en producción.
  - Limitar CORS al dominio del panel y clientes móviles en producción.
- Almacenamiento de archivos:
  - `backend/uploads/` es local: para producción considere S3 o almacenamiento gestionado.
  - Validar tamaño y tipos MIME en uploads.
- Base de datos:
  - Revisar el motor usado y adaptar migraciones/respaldos.
- Configuración móvil:
  - Actualizar la URL base de la API en `mobile-app/src/services` al apuntar al backend.
- Tests/CI:
  - Añadir suites de pruebas y scripts de CI (actualmente no se detecta carpeta de tests).

## Colaboración
- Abrir issues para bugs o mejoras.
- Crear ramas por feature/bugfix y enviar PRs con descripción clara.
- Agregar documentación de nuevos endpoints o cambios en modelos.

## Archivos clave
- `backend/index.js`
- `backend/src/models/index.js`
- `backend/src/controllers/*`
- `backend/seed.js`
- `mobile-app/App.js`, `mobile-app/src/`
- `web-admin/index.html`, `web-admin/src/`, `web-admin/vite.config.js`

---

Si quieres, puedo también crear un `.env.example` en `backend/` con las variables detectadas o ajustar este README con detalles exactos extraídos de `backend/src/models/index.js` y `backend/index.js`.

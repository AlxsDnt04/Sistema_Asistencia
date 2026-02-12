import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import {
  Search,
  UserPlus,
  Trash2,
  Upload,
  Edit,
  UserMinus,
  Save,
  X,
  BookOpen,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function AlumnosView() {
  const { user } = useContext(AuthContext); // Usamos el ID del contexto directamente
  // Datos
  const [materias, setMaterias] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  // Selecciones y Filtros
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState(""); // Filtro local de alumnos
  const [filtroMateriaAdmin, setFiltroMateriaAdmin] = useState(""); // Filtro de materias (Solo Admin)

  // Inputs de formularios
  const [cedulaInput, setCedulaInput] = useState("");
  const fileInputRef = useRef(null); // Referencia para limpiar el input file

  // edidion del alumno
  const [editingStudent, setEditingStudent] = useState(null); // Para el modal
  const [editForm, setEditForm] = useState({
    nombre: "",
    email: "",
    cedula: "",
  });

  // UI States
  const [cargando, setCargando] = useState(false);

  // 1. CARGAR MATERIAS (Lógica Admin vs Profesor)
  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/materias", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = res.data;

        // Si NO es admin, filtramos solo las del profesor
        if (user.rol !== "admin") {
          data = data.filter((m) => m.profesorId === user.id);
        }

        setMaterias(data);

        // Auto-seleccionar la primera si existe
        if (data.length > 0) {
          setMateriaSeleccionada(data[0].id);
        }
      } catch (error) {
        console.error("Error cargando materias", error);
        Swal.fire("Error", "No se pudieron cargar las materias", "error");
      }
    };

    if (user) cargarMaterias();
  }, [user]); // Dependencia: usuario del contexto

  // 2. CARGAR ALUMNOS (Cuando cambia la materia)
  useEffect(() => {
    const cargarAlumnos = async () => {
      if (!materiaSeleccionada) {
        setAlumnos([]);
        return;
      }

      setCargando(true);
      try {
        const res = await axios.get(
          `http://localhost:3000/api/alumnos/materia/${materiaSeleccionada}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setAlumnos(res.data);
      } catch (error) {
        console.error("Error cargando alumnos:", error);
        setAlumnos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();
  }, [materiaSeleccionada]);

  // --- LÓGICA DE FILTRADO ---

  // 1. Filtrar Materias (Para el selector del Admin)
  const materiasVisibles = materias.filter(
    (m) =>
      m.nombre.toLowerCase().includes(filtroMateriaAdmin.toLowerCase()) ||
      m.codigo.toLowerCase().includes(filtroMateriaAdmin.toLowerCase()),
  );

  // 2. Filtrar Alumnos (Búsqueda en tabla)
  const alumnosVisibles = alumnos.filter((alumno) => {
    const texto = busquedaAlumno.toLowerCase();
    return (
      alumno.nombre.toLowerCase().includes(texto) ||
      alumno.email.toLowerCase().includes(texto) ||
      (alumno.cedula || "").includes(texto)
    );
  });

  // --- HANDLERS (ACCIONES) ---

  const handleVincular = async (e) => {
    e.preventDefault();
    if (!cedulaInput) return;

    try {
      await axios.post(
        "http://localhost:3000/api/matricula/vincular",
        { cedula: cedulaInput, materiaId: materiaSeleccionada },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Vinculado",
        text: "Alumno agregado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      setCedulaInput("");
      // Recargar alumnos sin recargar página
      const res = await axios.get(
        `http://localhost:3000/api/alumnos/materia/${materiaSeleccionada}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setAlumnos(res.data);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo vincular",
        "error",
      );
    }
  };

  const handleDesmatricular = async (estudianteId) => {
    const result = await Swal.fire({
      title: "¿Desvincular alumno?",
      text: "El alumno ya no aparecerá en esta lista.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desvincular",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:3000/api/matricula/${estudianteId}/${materiaSeleccionada}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        // Actualizar estado localmente (más rápido que recargar API)
        setAlumnos((prev) => prev.filter((a) => a.id !== estudianteId));

        Swal.fire("Eliminado", "El alumno ha sido desvinculado.", "success");
      } catch (error) {
        console.error("Error desmatriculando alumno:", error);
        Swal.fire("Error", "No se pudo eliminar la matrícula", "error");
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivoExcel", file);
    formData.append("materiaId", materiaSeleccionada);

    try {
      Swal.fire({
        title: "Procesando Excel...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        "http://localhost:3000/api/matricula/masiva",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Swal.fire("Reporte de Carga", response.data.message, "info");

      // Limpiar input file
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Recargar tabla
      const res = await axios.get(
        `http://localhost:3000/api/alumnos/materia/${materiaSeleccionada}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setAlumnos(res.data);
    } catch (error) {
      console.error("Error en carga masiva:", error);
      Swal.fire("Error", "Falló la carga masiva", "error");
    }
  };

  const handleEditClick = (alumno) => {
    setEditingStudent(alumno);
    setEditForm({
      nombre: alumno.nombre,
      email: alumno.email,
      cedula: alumno.cedula || "",
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      // Usamos la ruta que creamos: /matricula/alumnos/:id
      await axios.put(
        `http://localhost:3000/api/matricula/alumnos/${editingStudent.id}`,
        editForm,
      );

      // Actualizamos la lista localmente para no recargar
      setAlumnos((prev) =>
        prev.map((al) =>
          al.id === editingStudent.id ? { ...al, ...editForm } : al,
        ),
      );

      setEditingStudent(null); // Cerrar modal
      alert("Alumno actualizado correctamente"); // O usa un toast/notificación
    } catch (error) {
      console.error(error);
      alert("Error al actualizar alumno");
    }
  };

  // --- C. ELIMINAR DEL SISTEMA (DELETE) ---
  const handleDeleteSystem = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro? Esto eliminará al usuario DE TODO EL SISTEMA, incluyendo sus notas y asistencias en OTRAS materias.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/matricula/alumnos/${id}`);
      // Quitar de la lista visualmente
      setAlumnos((prev) => prev.filter((al) => al.id !== id));
      alert("Usuario eliminado del sistema permanentemente.");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar usuario. Puede tener dependencias activas.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Alumnos</h2>
      </div>

      {/* --- PANEL DE CONTROL SUPERIOR --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA: SELECCIÓN DE MATERIA */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookOpen className="w-4 h-4" />
              Seleccionar Curso / Materia
            </label>

            {/* Buscador de materias (Solo Admin) */}
            {user.rol === "admin" && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar código o nombre de materia..."
                  className="w-full pl-9 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  value={filtroMateriaAdmin}
                  onChange={(e) => setFiltroMateriaAdmin(e.target.value)}
                />
              </div>
            )}

            <select
              className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
            >
              <option value="" className="text-gray-500">
                -- Selecciona una materia --
              </option>
              {materiasVisibles.map((mat) => (
                <option
                  key={mat.id}
                  value={mat.id}
                  className="text-gray-900 font-medium"
                >
                  {mat.nombre} ({mat.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* COLUMNA DERECHA: ACCIONES (Solo si hay materia) */}
          {materiaSeleccionada && (
            <div className="flex flex-col justify-end gap-4">
              {/* 1. Vincular Individual */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">
                  Vincular Estudiante
                </label>
                <form onSubmit={handleVincular} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingrese Cédula"
                    className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none text-gray-700"
                    value={cedulaInput}
                    onChange={(e) => setCedulaInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Agregar
                  </button>
                </form>
              </div>

              {/* 2. Carga Masiva (Solo Admin) */}
              {user.rol === "admin" && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <label className="text-xs font-bold text-gray-500 block">
                        <FileSpreadsheet className="w-8 h-8 inline-block mr-1" />
                        IMPORTAR DESDE EXCEL
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 text-xs text-blue-700 font-medium">
                        💡 Encabezados: cedula, nombre, apellido, email
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                    />
                  </div>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ÁREA DE TABLA Y BÚSQUEDA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Barra de herramientas de la tabla */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
          <h3 className="font-semibold text-gray-700">
            Listado de Estudiantes
          </h3>

          {/* Buscador dentro de la tabla */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              className="w-full pl-9 p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none text-gray-700"
              value={busquedaAlumno}
              onChange={(e) => setBusquedaAlumno(e.target.value)}
              disabled={!materiaSeleccionada}
            />
          </div>
        </div>

        {materiaSeleccionada ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cargando ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500 animate-pulse"
                    >
                      Cargando estudiantes...
                    </td>
                  </tr>
                ) : alumnosVisibles.length > 0 ? (
                  alumnosVisibles.map((alumno) => (
                    <tr
                      key={alumno.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {alumno.cedula || "S/N"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {alumno.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {alumno.email}
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                        {/* 1. BOTÓN EDITAR (Solo Admin) */}
                        {user.rol === "admin" && (
                          <button
                            onClick={() => handleEditClick(alumno)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Editar datos del alumno"
                          >
                            <Edit size={18} />
                          </button>
                        )}

                        {/* 2. BOTÓN DESVINCULAR (Sacar de ESTA materia - Para todos) */}
                        <button
                          onClick={() => handleDesmatricular(alumno.id)}
                          className="text-orange-500 hover:text-orange-700 p-1 rounded hover:bg-orange-50 transition-colors"
                          title="Desvincular de esta materia (No borra usuario)"
                        >
                          {/* Cambié el icono a UserMinus para que se entienda que es "sacar del grupo" */}
                          <UserMinus size={18} />
                        </button>

                        {/* 3. BOTÓN ELIMINAR SISTEMA (Solo Admin - Peligroso) */}
                        {user.rol === "admin" && (
                          <button
                            onClick={() => handleDeleteSystem(alumno.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                            title="ELIMINAR DEL SISTEMA (Irreversible)"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {busquedaAlumno
                        ? "No se encontraron alumnos con esa búsqueda."
                        : "No hay alumnos inscritos en este curso."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
            <p>Selecciona un curso arriba para gestionar sus estudiantes.</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Encabezado Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Editar Alumno
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  value={editForm.nombre}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  value={editForm.cedula}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cedula: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

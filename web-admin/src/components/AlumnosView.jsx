import { useState, useEffect, useContext, useRef, useCallback } from "react";
import api from "../api/axiosConfig";
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
  // 1. CONSUMIMOS LAS MATERIAS GLOBALES DEL CONTEXTO
  const { user, misMaterias, loadingMaterias } = useContext(AuthContext);

  // Datos locales (Solo alumnos, las materias ya vienen del AuthContext)
  const [alumnos, setAlumnos] = useState([]);

  // Selecciones y Filtros
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [filtroMateriaAdmin, setFiltroMateriaAdmin] = useState("");

  // Inputs de formularios
  const [cedulaInput, setCedulaInput] = useState("");
  const fileInputRef = useRef(null);

  // Edición del alumno
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    email: "",
    cedula: "",
  });

  // Autoseleccionar la primera materia global si está disponible
  useEffect(() => {
    if (misMaterias && misMaterias.length > 0 && !materiaSeleccionada) {
      setMateriaSeleccionada(misMaterias[0].id);
    }
  }, [misMaterias, materiaSeleccionada]);

  // 2. CARGAR ALUMNOS USANDO TU INSTANCIA 'api' (Sin headers manuales)
  const cargarAlumnos = useCallback(async () => {
    if (!materiaSeleccionada) return;
    try {
      const res = await api.get(`/alumnos/materia/${materiaSeleccionada}`);
      setAlumnos(res.data);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    }
  }, [materiaSeleccionada]);

  useEffect(() => {
    cargarAlumnos();
  }, [cargarAlumnos]);

  // 3. MATRICULAR ALUMNO POR CÉDULA
  const handleMatricular = async (e) => {
    e.preventDefault();
    if (!materiaSeleccionada) return;

    try {
      await api.post("/matricula/vincular", {
        cedula: cedulaInput,
        materiaId: materiaSeleccionada,
      });

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Estudiante matriculado correctamente en este curso.",
        timer: 2000,
        showConfirmButton: false,
      });

      setCedulaInput("");
      cargarAlumnos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.error ||
          "No se pudo vincular, verifique la cédula o el estudiante no esta registrado.",
      });
    }
  };

  // 4. DESMATRICULAR/ELIMINAR ALUMNO DEL CURSO
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
        await api.delete(`/matricula/${estudianteId}/${materiaSeleccionada}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Actualizar estado localmente (si usas setAlumnos o la variable que tengas para la lista)
        setAlumnos((prev) => prev.filter((a) => a.id !== estudianteId));

        Swal.fire("Eliminado", "El alumno ha sido desvinculado.", "success");
      } catch (error) {
        console.error("Error desmatriculando alumno:", error);
        Swal.fire("Error", "No se pudo eliminar la matrícula", "error");
      }
    }
  };

  const handleDeleteSystem = async (id) => {
  const result = await Swal.fire({
    title: "¿Eliminar alumno del sistema?",
    text: "¡Atención! Esto eliminará al usuario de TODO el sistema de asistencia de forma permanente, incluyendo sus matrículas y registros en OTRAS materias. Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",     
    cancelButtonColor: "#3085d6",   
    confirmButtonText: "Sí, eliminar permanentemente",
    cancelButtonText: "Cancelar",
  });

  // Si el administrador confirma la acción
  if (result.isConfirmed) {
    try {
      // Petición usando tu Axios inyectado
      await api.delete(`/matricula/alumnos/${id}`);
      
      // Quitar de la lista visualmente en el estado local
      setAlumnos((prev) => prev.filter((al) => al.id !== id));
      
      // Alerta de éxito al terminar
      Swal.fire(
        "¡Eliminado!",
        "El estudiante ha sido borrado del sistema por completo.",
        "success"
      );
    } catch (error) {
      console.error("Error al eliminar usuario del sistema:", error);
      Swal.fire(
        "Error",
        "No se pudo eliminar al usuario. Es posible que tenga dependencias activas o problemas de red.",
        "error"
      );
    }
  }
};

  // 5. CARGA MASIVA MEDIANTE EXCEL / CSV
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !materiaSeleccionada) return;

    const formData = new FormData();
    formData.append("archivoExcel", file);
    formData.append("materiaId", materiaSeleccionada);

    try {
      Swal.fire({
        title: "Cargando estudiantes...",
        text: "Por favor espere",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.post("/matricula/masiva", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "¡Carga Masiva Exitosa!",
        text: "Los estudiantes se han registrado y matriculado correctamente.",
      });

      cargarAlumnos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en la carga",
        text:
          error.response?.data?.error ||
          "Asegúrate de que el formato sea correcto.",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 6. ACTUALIZAR INFORMACIÓN DEL ALUMNO (EDICIÓN)
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/matricula/alumnos/${editingStudent.id}`, editForm);

      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "Datos del estudiante actualizados correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      setEditingStudent(null);
      cargarAlumnos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.error || "No se pudieron actualizar los datos.",
      });
    }
  };

  const abrirModalEdicion = (alumno) => {
    setEditingStudent(alumno);
    setEditForm({
      nombre: alumno.nombre,
      email: alumno.email,
      cedula: alumno.cedula,
    });
  };

  // Filtros de búsqueda locales
  const alumnosFiltrados = alumnos.filter((alumno) => {
    const coincideBusqueda =
      alumno.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
      alumno.cedula.includes(busquedaAlumno);
    return coincideBusqueda;
  });

  const materiasParaAdmin =
    user?.rol === "admin"
      ? misMaterias.filter((m) =>
          m.nombre.toLowerCase().includes(filtroMateriaAdmin.toLowerCase()),
        )
      : [];

  return (
    <div className="space-y-6">
      {/* Selector de Materia */}
      <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Gestión de Estudiantes
            </h2>
            <p className="text-sm text-slate-500">
              {user?.rol === "admin"
                ? "Panel de Administrador"
                : "Panel de Docente"}
            </p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
            Seleccionar Curso
          </label>
          {loadingMaterias ? (
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 outline-none focus:border-violet-500 transition-colors cursor-pointer"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
            >
              {misMaterias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.codigo})
                </option>
              ))}
              {misMaterias.length === 0 && (
                <option value="">No tienes cursos asignados</option>
              )}
            </select>
          )}
        </div>
      </div>

      {materiaSeleccionada && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Formularios de Registro e Importación */}
          <div className="space-y-6">
            {/* Registro Individual */}
            <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-violet-500" /> Vincular
                Estudiante
              </h3>
              <form onSubmit={handleMatricular} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Número de Cédula
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1725364758"
                    className="w-full px-3 py-2 border border-slate-200 rounded-2xl outline-none focus:border-violet-500 text-slate-700 font-medium"
                    value={cedulaInput}
                    onChange={(e) => setCedulaInput(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-violet-600 text-white py-2.5 rounded-2xl font-bold hover:bg-violet-700 transition flex justify-center items-center gap-2 shadow-sm cursor-pointer"
                >
                  <UserPlus size={18} /> Vincular
                </button>
              </form>
            </div>

            {/* Carga Masiva */}
            <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-violet-500" /> Carga
                Masiva (.csv)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Sube un archivo separado por comas con las columnas:{" "}
                <b>cedula, nombre, email</b>
              </p>
              <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-slate-600 block">
                  Seleccionar archivo CSV
                </span>
              </div>
            </div>
          </div>

          {/* Listado de Matriculados */}
          <div className="xl:col-span-2 bg-slate-50/90 rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-violet-600" /> Alumnos
                Matriculados ({alumnosFiltrados.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre o cédula..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white/80 border border-slate-200 rounded-2xl text-sm outline-none focus:border-violet-500 text-slate-700 font-medium"
                  value={busquedaAlumno}
                  onChange={(e) => setBusquedaAlumno(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Estudiante</th>
                    <th className="px-6 py-3">Cédula</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumnosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-slate-400 italic"
                      >
                        No se encontraron estudiantes matriculados.
                      </td>
                    </tr>
                  ) : (
                    alumnosFiltrados.map((alumno) => (
                      <tr
                        key={alumno.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {alumno.nombre}
                          </div>
                          <div className="text-xs text-slate-400">
                            {alumno.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {alumno.cedula}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                          <button
                            onClick={() => abrirModalEdicion(alumno)}
                            className="text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                            title="Editar estudiante"
                          >
                            <Edit size={18} />
                          </button>
                          <div className="flex space-x-2">
                            {/* 1. BOTÓN DESMATRICULAR: Solo para profesores (o roles distintos a admin) */}
                            {user?.rol !== "admin" && (
                              <button
                                onClick={() => handleDesmatricular(alumno.id)}
                                className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md transition-colors"
                              >
                                Desvincular Curso
                              </button>
                            )}

                            {/* 2. BOTÓN ELIMINAR SISTEMA: Solo visible para el Administrador */}
                            {user?.rol === "admin" && (
                              <button
                                onClick={() => handleDeleteSystem(alumno.id)}
                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                              >
                                Eliminar del Sistema
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN (Glassmorphism) */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Modificar Información General
            </h3>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none text-slate-700 font-medium"
                  value={editForm.nombre}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none text-slate-700 font-medium"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cédula
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none text-slate-700 font-medium"
                  value={editForm.cedula}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cedula: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-violet-600 rounded-2xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 font-bold cursor-pointer shadow-sm"
                >
                  <Save size={18} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILTRO EXTRA PARA MODO ADMINISTRADOR */}
      {user?.rol === "admin" && (
        <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Search size={18} className="text-slate-500" /> Localizador Global
            de Cursos
          </h3>
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filtrar catálogo completo de materias..."
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-2xl text-sm outline-none focus:border-violet-500"
              value={filtroMateriaAdmin}
              onChange={(e) => setFiltroMateriaAdmin(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {materiasParaAdmin.map((m) => (
              <button
                key={m.id}
                onClick={() => setMateriaSeleccionada(m.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  materiaSeleccionada == m.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

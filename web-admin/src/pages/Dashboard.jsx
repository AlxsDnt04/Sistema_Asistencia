import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import AlumnosView from "../components/AlumnosView";
import ReportesView from "../components/ReportesView";
import MateriasView from "../components/MateriasView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Download,
  Power,
  Users,
  Clock,
  BookOpen,
  Trash2,
  X,
  Search,
} from "lucide-react";

// Conexión al socket
const socket = io("http://localhost:3000");

// --- COMPONENTE GRAFICA ---
const DonutChart = ({ presentes, total }) => {
  // Evitar división por cero
  const validTotal = total > 0 ? total : 1;
  const porcentaje = Math.round((presentes / validTotal) * 100) || 0;
  const strokeDash = `${porcentaje}, 100`;

  const color =
    porcentaje < 50
      ? "text-red-500"
      : porcentaje < 80
        ? "text-yellow-500"
        : "text-green-500";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={strokeDash}
          className={`${color} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-slate-700">{porcentaje}%</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  // --- ESTADOS ---
  const [qrValue, setQrValue] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [sesionActiva, setSesionActiva] = useState(false);
  const [vistaActual, setVistaActual] = useState("dashboard");

  // Estados Materias
  const [misMaterias, setMisMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [loadingMaterias, setLoadingMaterias] = useState(true);

  // UI States
  const [qrZoom, setQrZoom] = useState(false);
  const [stats, setStats] = useState({ presentes: 0, matriculados: 0 });
  const [isChanging, setIsChanging] = useState(false);

  // --- 1. CARGAR CURSOS DEL PROFESOR ---
  useEffect(() => {
    const token = localStorage.getItem('token'); 

    if (user && token) {
      // 2. CONFIGURAR HEADERS
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      axios
        .get("http://localhost:3000/api/materias", config)
        .then((res) => {
          const todasLasMaterias = res.data;
          
          // Filtramos: Admin ve todo, Profe solo las suyas
          const cursosFiltrados =
            user.rol === "admin"
              ? todasLasMaterias
              : todasLasMaterias.filter((m) => m.profesorId === user.id); // BD sea profesorId o usuarioId

          setMisMaterias(cursosFiltrados);

          // Seleccionar default si hay cursos
          if (cursosFiltrados.length > 0) {
            setMateriaSeleccionada(cursosFiltrados[0].id);
          }
          setLoadingMaterias(false);
        })
        .catch((err) => {
          console.error("Error cargando materias", err);
          
          // Opcional: Si el token expiró (401), podrías cerrar sesión automáticamente
          if (err.response && err.response.status === 401) {
             // localStorage.clear();
             // window.location.href = '/';
          }
          
          setLoadingMaterias(false);
        });
    }
  }, [user]);

  // --- 2. UNIFICADO: CARGAR DATOS DEL CURSO (Historial + Stats) ---
  const fetchDatosCurso = useCallback(async () => {
    if (!materiaSeleccionada) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/api/asistencia/hoy?materiaId=${materiaSeleccionada}`,
      );
      const data = res.data.asistencias || [];

      setAsistencias(data);
      setStats({
        presentes: data.length,
        matriculados: res.data.totalMatriculados || 0,
      });
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setIsChanging(false);
    }
  }, [materiaSeleccionada]);

  // Ejecutar carga inicial cuando cambia la materia
  useEffect(() => {
    fetchDatosCurso();
  }, [fetchDatosCurso]);

  // --- 3. SOCKETS (Gestión de Salas) ---
  useEffect(() => {
    if (!materiaSeleccionada) return;

    socket.emit("join-room", `curso_${materiaSeleccionada}`);
    
    const handleNuevaAsistencia = (nuevaAsistencia) => {
      console.log("⚡ Nueva asistencia recibida:", nuevaAsistencia);

      // Convertimos a String ambos para evitar errores de tipo (ej: "5" vs 5)
      if (String(nuevaAsistencia.materiaId) !== String(materiaSeleccionada)) return;

      setAsistencias((prev) => {
        // Evitar duplicados visuales
        if (prev.some((a) => a.id === nuevaAsistencia.id)) return prev;
        // Agregar al inicio
        return [nuevaAsistencia, ...prev];
      });

      // Actualizar contador
      setStats((prev) => ({
        ...prev,
        presentes: prev.presentes + 1,
      }));
    };

    socket.on("nueva-asistencia", handleNuevaAsistencia);

    return () => {
      socket.off("nueva-asistencia", handleNuevaAsistencia);
    };
  }, [materiaSeleccionada]); // Dependencia: Solo se reinicia si cambia la materia

  // --- 4. GENERACIÓN DE QR (Bucle de 10s) ---
  useEffect(() => {
    if (!materiaSeleccionada || !sesionActiva) {
        setQrValue(""); // Limpiamos el QR si se cierra sesión
        return;
    }

    const obtenerNuevoQR = async () => {
      try {
        const tokenLocal = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:3000/api/asistencia/generar-qr",
          { materiaId: materiaSeleccionada },
          { headers: { Authorization: `Bearer ${tokenLocal}` } }
        );
        // Actualizamos el QR en pantalla
        setQrValue(res.data.token);
      } catch (error) {
        console.error("Error generando QR:", error);
        // Opcional: Si falla mucho, detener la sesión
        // setSesionActiva(false); 
      }
    };

    // 1. Llamada inmediata al activar
    obtenerNuevoQR();

    // 2. Intervalo cada 10 segundos
    const intervalo = setInterval(obtenerNuevoQR, 10000);

    // 3. Limpieza del intervalo
    return () => clearInterval(intervalo);
  }, [materiaSeleccionada, sesionActiva]);

  // --- MANEJADORES ---
  const toggleSesion = () => {
    if (!materiaSeleccionada) {
      alert("Selecciona un curso primero");
      return;
    }

    // Si estamos apagando, limpiar QR
    if (sesionActiva) {
      setQrValue("");
      setSesionActiva(false);
    } else {
      // Si estamos encendiendo, el useEffect se encargará de pedir el QR
      setSesionActiva(true);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // --- EXPORTAR ---
  const exportarPDF = () => {
    const doc = new jsPDF();
    const nombreMateria =
      misMaterias.find((m) => m.id == materiaSeleccionada)?.nombre || "Clase";

    doc.setFontSize(18);
    doc.text("Reporte de Asistencia", 14, 20);
    doc.setFontSize(12);
    doc.text(`Materia: ${nombreMateria}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);

    const tableColumn = ["Nombre", "Hora", "Estado"];
    const tableRows = asistencias.map((asis) => [
      asis.Usuario?.nombre || "Desconocido",
      new Date(asis.createdAt).toLocaleTimeString(),
      "Presente",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: "grid",
    });

    doc.save(`Asistencia_${nombreMateria}.pdf`);
  };

  const exportarExcel = () => {
    const nombreMateria =
      misMaterias.find((m) => m.id == materiaSeleccionada)?.nombre || "Clase";
    const ws = XLSX.utils.json_to_sheet(
      asistencias.map((a) => ({
        Nombre: a.Usuario?.nombre,
        Hora: new Date(a.createdAt).toLocaleTimeString(),
        Fecha: new Date().toLocaleDateString(),
        Estado: "Presente",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, `Asistencia_${nombreMateria}.xlsx`);
  };

  // --- ELIMINAR ASISTENCIA ---
  const handleEliminar = async (id) => {
    // 1. Confirmación de seguridad
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;

    try {
        // 2. Obtenemos el token REAL del almacenamiento (como se ve en tu imagen)
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Error: No se encontró el token de seguridad.");
            return;
        }

        // 3. Enviamos la petición DELETE incluyendo el TOKEN en los headers
        await axios.delete(`http://localhost:3000/api/asistencia/${id}`, {
            headers: {
                // Dependiendo de tu middleware, a veces se requiere 'Bearer ' antes del token.
                // Si esto falla, prueba: `Bearer ${token}`
                Authorization: token 
            }
        });
        
        // 4. Actualizamos la tabla visualmente (UI)
        setAsistencias(prev => prev.filter(a => a.id !== id));
        
        // Actualizamos las métricas restando 1
        setStats(prev => ({ ...prev, presentes: prev.presentes - 1 }));

        console.log("✅ Registro eliminado");

    } catch (error) {
        console.error("Error eliminando:", error);
        // Si el error es 401 o 403, es problema de permisos/token
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            alert("No tienes permiso para eliminar esto. Tu sesión puede haber expirado.");
        } else {
            alert("No se pudo eliminar el registro");
        }
    }
  };

  // --- FUNCIÓN RENDERIZADO DEL MODAL
  const renderQrModal = () => {
    if (!qrZoom || !qrValue) return null;

    return (
      <div
        // 1. Fondo oscuro y efecto borroso (Backdrop)
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setQrZoom(false)}
      >
        <div
          // 2. Tarjeta del Modal con efecto glassmorphism
          className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative animate-in zoom-in-95 duration-200 border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón de Cerrar (X) */}
          <button
            onClick={() => setQrZoom(false)}
            className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* Título y Subtítulo */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-800 text-white">
              Escanear Asistencia
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              El código se actualiza automáticamente
            </p>
          </div>

          {/* Contenedor del QR con borde decorativo */}
          <div className="flex justify-center bg-slate-50 p-4 rounded-xl border-2 border-dashed border-indigo-200 mb-6">
            <QRCodeSVG
              value={qrValue}
              size={300}
              level={"H"}
              includeMargin={true}
            />
          </div>

          {/* Estado inferior animado */}
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium bg-indigo-50 py-3 rounded-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            Esperando estudiantes...
          </div>
        </div>
      </div>
    );
  };

  const renderContenido = () => {
    if (vistaActual === "alumnos") return <AlumnosView usuarioId={user?.id} />;
    if (vistaActual === "reportes") return <ReportesView />;
    if (vistaActual === "materias")
      return <MateriasView usuarioId={user?.id} />;

    // DASHBOARD DEFAULT
    return (
      <div
        className={`space-y-6 transition-all duration-500 ${isChanging ? "opacity-50 translate-y-2" : "opacity-100"}`}
      >
        {/* PARTE SUPERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TARJETA QR */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-blue-200 group relative">
              {sesionActiva && qrValue ? (
                <div
                  onClick={() => setQrZoom(true)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <QRCodeSVG value={qrValue} size={180} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/10 transition-opacity rounded-xl">
                    <span className="bg-slate-800 text-white px-2 py-1 text-xs rounded-full shadow font-bold flex items-center gap-1">
                      <Search size={14} /> Ampliar
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-sm flex-col">
                  <Power size={40} className="mb-2 opacity-20" />
                  {sesionActiva ? "Cargando QR..." : "Clase Inactiva"}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-800">
                Escáner de Asistencia
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                <Clock size={16} className="inline mr-1" />
                {sesionActiva
                  ? "El código cambia cada 10s"
                  : "Inicia la clase para generar QR"}
              </p>

              <button
                onClick={toggleSesion}
                disabled={!materiaSeleccionada}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md mx-auto md:mx-0 ${
                  sesionActiva
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
                }`}
              >
                <Power size={20} />
                {sesionActiva ? "FINALIZAR CLASE" : "INICIAR CLASE"}
              </button>
            </div>
          </div>

          {/* TARJETA METRICAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-500 text-xs uppercase tracking-widest mb-4">
                Métricas en Vivo
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-5xl font-bold text-slate-800">
                    {stats.presentes}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    de {stats.matriculados} alumnos
                  </p>
                </div>
                <DonutChart
                  presentes={stats.presentes}
                  total={stats.matriculados}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={exportarExcel}
                className="flex-1 bg-green-50 text-green-700 py-2 rounded text-sm hover:bg-green-100 flex justify-center items-center gap-2"
              >
                <Download size={16} /> Excel
              </button>
              <button
                onClick={exportarPDF}
                className="flex-1 bg-red-50 text-red-700 py-2 rounded text-sm hover:bg-red-100 flex justify-center items-center gap-2"
              >
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-blue-500" /> Asistencias de Hoy
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asistencias.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-slate-400 italic"
                    >
                      No hay registros aún.
                    </td>
                  </tr>
                ) : (
                  asistencias.map((asis) => (
                    <tr key={asis.id} className="hover:bg-blue-50/30">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {asis.Usuario?.nombre
                            ? asis.Usuario.nombre.charAt(0)
                            : "?"}
                        </div>
                        <div>
                          <p>{asis.Usuario?.nombre || "Desconocido"}</p>
                          <p className="text-xs text-slate-400 font-normal">
                            {asis.Usuario?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {new Date(asis.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                          Presente
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEliminar(asis.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Eliminar registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const manejarCambioMateria = (e) => {
    const nuevoId = e.target.value;
    setIsChanging(true);
    setMateriaSeleccionada(nuevoId);
    setSesionActiva(false);
    setQrValue("");
  };

  

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar
        onLogout={cerrarSesion}
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
      />
      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {vistaActual === "dashboard"
                ? "Panel de Control"
                : vistaActual.charAt(0).toUpperCase() + vistaActual.slice(1)}
            </h1>
            <p className="text-sm text-slate-500">Bienvenido, {user?.nombre}</p>
          </div>
          {vistaActual === "dashboard" && (
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border">
              <BookOpen size={20} className="text-blue-500 ml-2" />
              {/* En la sección del Header donde está el select */}
              <div className="pr-2">
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Curso
                </p>
                {/* AQUÍ USAMOS LA VARIABLE loadingMaterias */}
                {loadingMaterias ? (
                  <span className="text-sm text-slate-400 font-medium animate-pulse">
                    Cargando cursos...
                  </span>
                ) : (
                  <select
                    className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-40"
                    value={materiaSeleccionada}
                    // CAMBIO IMPORTANTE PARA EL ERROR 2 (VER ABAJO)
                    onChange={manejarCambioMateria}
                    disabled={sesionActiva}
                  >
                    {misMaterias.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                    {misMaterias.length === 0 && (
                      <option value="">Sin cursos</option>
                    )}
                  </select>
                )}
              </div>
            </div>
          )}
        </header>
        <div className="animate-in fade-in duration-500">
          {renderContenido()}
        </div>
      </div>
      {renderQrModal()}
    </div>
  );
}

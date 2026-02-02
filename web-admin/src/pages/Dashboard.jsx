import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import AlumnosView from "../components/AlumnosView";
import ReportesView from "../components/ReportesView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Download, Power, Users, Clock, BookOpen, BarChart3 } from "lucide-react";

// Conexión al socket
const socket = io("http://localhost:3000");

export default function Dashboard() {
  // --- ESTADOS ---
  const [usuario] = useState(() => {
    const saved = localStorage.getItem("usuario");
    return saved ? JSON.parse(saved) : null;
  });

  const [qrValue, setQrValue] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [sesionActiva, setSesionActiva] = useState(false);
  const [vistaActual, setVistaActual] = useState("dashboard");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("1"); // ID 

  // --- SOCKETS ---
  useEffect(() => {
    socket.on("asistencia-registrada", (data) => {
      setAsistencias((prev) => [data, ...prev]);
    });

    socket.on("qr-code", (token) => {
      if (sesionActiva) {
        setQrValue(token);
      }
    });

    return () => {
      socket.off("asistencia-registrada");
      socket.off("qr-code");
    };
  }, [sesionActiva]);

  // --- MANEJADORES ---
  const toggleSesion = () => {
    const nuevoEstado = !sesionActiva;
    setSesionActiva(nuevoEstado);
    if (!nuevoEstado) setQrValue("");
  };

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // --- EXPORTAR---
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título y fecha
    doc.setFontSize(18);
    doc.text("Reporte de Asistencia", 14, 20);
    doc.setFontSize(12);
    doc.text(`Materia: Base de Datos I`, 14, 30); // nombre de la materia dinámica
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);

    const tableColumn = ["Nombre", "Hora", "Fecha", "Estado"];
    const tableRows = asistencias.map((asis) => [
      asis.nombre,
      asis.hora,
      asis.fecha,
      "Presente",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] } // Color azul bonito
    });

    doc.save(`Asistencia_${new Date().toLocaleDateString()}.pdf`);
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      asistencias.map((a) => ({
        Nombre: a.nombre,
        Hora: a.hora,
        Fecha: a.fecha,
        Estado: "Presente",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, `Asistencia_${new Date().toLocaleDateString()}.xlsx`);
  };

  // --- RENDERIZADO DE VISTAS ---
  const renderContenido = () => {
    if (vistaActual === "alumnos") {
      return <AlumnosView />;
    }

    if (vistaActual === "reportes") {
      return <ReportesView />;
    }

    // VISTA DEFAULT: DASHBOARD
    return (
      <div className="space-y-6">
        {/* FILA SUPERIOR: QR + ESTADÍSTICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TARJETA 1 */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-blue-200">
              {sesionActiva && qrValue ? (
                <QRCodeSVG value={qrValue} size={180} />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-sm text-center">
                  QR Inactivo
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4 w-full text-center md:text-left">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Escáner de Asistencia</h3>
                <p className="text-slate-500 text-sm">El código se actualiza cada 10s</p>
              </div>
              
              <div className="flex items-center gap-4 justify-center md:justify-start">
                 <button
                  onClick={toggleSesion}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                    sesionActiva 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-slate-800 text-white hover:bg-slate-700"
                  }`}
                >
                  <Power size={20} />
                  {sesionActiva ? "EN CURSO" : "INICIAR CLASE"}
                </button>
                
                {sesionActiva && (
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
              </div>
            </div>
          </div>

          {/* TARJETA 2: ESTADÍSTICAS RÁPIDAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
                <h3 className="font-semibold text-slate-500 mb-4">Resumen de hoy</h3>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-slate-800">{asistencias.length}</span>
                    <span className="text-slate-400 mb-1">presentes</span>
                </div>
                {/* Barra de progreso simulada */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(asistencias.length * 10, 100)}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 text-right">Meta: 30 alumnos</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button onClick={exportarExcel} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition flex justify-center items-center gap-2">
                    <Download size={16}/> Excel
                </button>
                <button onClick={exportarPDF} className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition flex justify-center items-center gap-2">
                    <Download size={16}/> PDF
                </button>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: TABLA DE ASISTENCIA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-blue-500"/> Lista de Asistencia
                </h3>
                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                    {new Date().toLocaleDateString()}
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
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
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                                    No hay registros todavía...
                                </td>
                            </tr>
                        ) : (
                            asistencias.map((alumno, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {alumno.nombre.charAt(0)}
                                        </div>
                                        {alumno.nombre}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-500">
                                        {alumno.hora}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                            Presente
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-red-500 transition">
                                            Eliminar
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

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      {/* Sidebar con props para controlar la vista */}
      <Sidebar 
        usuario={usuario} 
        onLogout={cerrarSesion} 
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
      />

      <div className="flex-1 ml-64 p-8">
        {/* HEADER GLOBAL */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {vistaActual === 'dashboard' ? 'Panel de Control' : 
               vistaActual === 'alumnos' ? 'Estudiantes' : 'Reportes'}
            </h1>
            <p className="text-sm text-slate-500">
               Bienvenido, {usuario?.nombre || "Profesor"}
            </p>
          </div>

          {/* SELECTOR DE CURSO */}
          {vistaActual === 'dashboard' && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <BookOpen size={20} />
                  </div>
                  <div className="pr-2">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Curso Actual</p>
                      <select 
                        className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                        value={materiaSeleccionada}
                        onChange={(e) => setMateriaSeleccionada(e.target.value)}
                      >
                          <option value="1">Base de Datos I</option>
                          <option value="2">Ingeniería de Software</option>
                          <option value="3">Programación Web</option>
                      </select>
                  </div>
              </div>
          )}
        </header>

        {/* CONTENIDO DINÁMICO */}
        <div className="animate-in fade-in duration-500">
            {renderContenido()}
        </div>
      </div>
    </div>
  );
}
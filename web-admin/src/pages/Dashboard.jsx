import React from "react";
import useDashboardData from "../hooks/useDashboardData"; 
import { BookOpen } from "lucide-react";

// Marcos de Navegación y Vistas Complementarias
import Sidebar from "../components/Sidebar";
import AlumnosView from "../components/AlumnosView";
import ReportesView from "../components/ReportesView";
import MateriasView from "../components/MateriasView";
import ProfesoresView from "../components/ProfesoresView";

// Componentes del Dashboard Modularizados
import LiveStatsCard from "../components/dashboard/LiveStatsCard";
import QrScannerCard from "../components/dashboard/QrScannerCard";
import AsistenciasTable from "../components/dashboard/AsistenciasTable";
import QrModal from "../components/dashboard/QrModal";

export default function Dashboard() {
  const data = useDashboardData();

  // Protegemos las variables asegurando que siempre sean arreglos antes de renderizar
  const materiasSeguras = data?.misMaterias || [];
  const alumnosMatriculadosCount = data?.totalMatriculados ?? data?.alumnosMatriculados?.length ?? 0;
  const asistenciasEnVivoCount = data?.asistenciasEnVivo?.length || 0;

  const renderContenido = () => {
    switch (data?.vistaActual) {
      case "alumnos":
        return <AlumnosView />;
      case "reportes":
        return <ReportesView />;
      case "materias":
        return <MateriasView />;
      case "profesores":
        return data?.user?.rol === "admin" ? <ProfesoresView /> : null;
      default:
        if (data?.user?.rol === "admin") {
          return (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center max-w-xl mx-auto mt-12">
              <BookOpen size={48} className="text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Panel Administrativo Global</h3>
              <p className="text-slate-500 text-sm">
                Utiliza la barra lateral izquierda para gestionar el catálogo de cursos, administrar al personal docente o auditar reportes globales de asistencia.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <LiveStatsCard 
              matriculados={alumnosMatriculadosCount} 
              presentes={asistenciasEnVivoCount} 
            />
            <QrScannerCard 
              sesionActiva={data?.sesionActiva} 
              deshabilitado={materiasSeguras.length === 0} 
              onIniciar={data?.iniciarSesionQr} 
              onTerminar={data?.terminarSesionQr} 
              onVer={() => data?.setModalQrAbierto(true)} 
            />
            <AsistenciasTable 
              asistencias={data?.asistenciasFiltradas || []} 
              filtro={data?.filtroAsistencia || ""} 
              setFiltro={data?.setFiltroAsistencia} 
            />
          </div>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased">
      <Sidebar
        onLogout={data?.logout}
        vistaActual={data?.vistaActual || "dashboard"}
        setVistaActual={data?.setVistaActual}
      />

      <div className="flex-1 pl-64">
        <header className="bg-white h-20 px-8 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-black text-slate-800">
              {data?.vistaActual === "dashboard" ? "Resumen de Actividades" : "Módulos del Sistema"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Hola, {data?.user?.nombre || "Usuario"} — Rol: {data?.user?.rol?.toUpperCase()}
            </p>
          </div>

          {data?.vistaActual === "dashboard" && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 px-4 flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Curso Seleccionado</p>
                {data?.loadingMaterias ? (
                  <span className="text-sm text-slate-400 font-medium animate-pulse">
                    Sincronizando cursos...
                  </span>
                ) : (
                  <select
                    className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-44"
                    value={data?.materiaSeleccionada}
                    onChange={(e) => data?.cambiarMateria(e.target.value)}
                    disabled={data?.sesionActiva}
                  >
                    {materiasSeguras.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                    {materiasSeguras.length === 0 && <option value="">Sin cursos asignados</option>}
                  </select>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="p-8 animate-in fade-in duration-300">
          {renderContenido()}
        </div>
      </div>

      <QrModal 
        abierto={data?.modalQrAbierto} 
        token={data?.qrToken} 
        onCerrar={() => data?.setModalQrAbierto(false)} 
        onTerminar={data?.terminarSesionQr} 
      />
    </div>
  );
}
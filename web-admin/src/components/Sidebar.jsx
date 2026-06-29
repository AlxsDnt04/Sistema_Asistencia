import React, { useContext } from "react"; 
import { LayoutDashboard, Users, FileText, LogOut, BookOpen, GraduationCap, User2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext"; 

export default function Sidebar({
  onLogout,
  vistaActual,
  setVistaActual,
}) {
  
  // Usamos el hook para obtener el usuario globalmente
  const { user } = useContext(AuthContext);

  // Función auxiliar para formatear roles
  const formatRol = (rol) => {
    if (!rol) return "";
    switch (rol) {
      case "admin":
        return "ADMINISTRADOR";
      case "profesor":
        return "DOCENTE";
      default:
        return rol.toUpperCase();
    }
  };
  
  return (
    <div className="h-screen w-64 bg-slate-950/95 text-white fixed left-0 top-0 flex flex-col shadow-[0_30px_80px_-30px_rgba(15,23,42,0.9)] border-r border-slate-800/70 z-50 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-violet-500/15 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-20 w-36 h-36 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-4 bottom-24 w-40 h-40 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />

      {/* Perfil del Usuario */}
      <div className="relative p-6 border-b border-slate-700/70 flex flex-col items-center bg-slate-950/90">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20 flex items-center justify-center mb-3 border-4 border-slate-900">
          <User2 size={60} className="text-white" />
        </div>
        <h3 className="font-bold text-lg text-center text-white">
          {user?.nombre || "Usuario"}
        </h3>
        <p className="text-xs text-slate-300 uppercase tracking-wider bg-slate-900/80 px-3 py-1 rounded-full mt-2 ring-1 ring-slate-700/80">
          {user?.rol ? formatRol(user.rol) : "INVITADO"}
        </p>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setVistaActual("dashboard")}
          className={`flex items-center w-full p-3 rounded-2xl transition-all duration-200 ${vistaActual === "dashboard" ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
        >
          <LayoutDashboard size={20} className="mr-3" />
          Dashboard
        </button>

        <button
          onClick={() => setVistaActual("alumnos")}
          className={`flex items-center w-full p-3 rounded-2xl transition-all duration-200 ${vistaActual === "alumnos" ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
        >
          <Users size={20} className="mr-3" />
          Alumnos
        </button>

        <button
          onClick={() => setVistaActual("reportes")}
          className={`flex items-center w-full p-3 rounded-2xl transition-all duration-200 ${vistaActual === "reportes" ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
        >
          <FileText size={20} className="mr-3" />
          Reportes
        </button>
        <button
          onClick={() => setVistaActual("materias")}
          className={`flex items-center w-full p-3 rounded-2xl transition-all duration-200 ${vistaActual === "materias" ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
        >
          <BookOpen size={20} className="mr-3" />
          Cursos
        </button>
        {user?.rol === 'admin' && (
          <button
            onClick={() => setVistaActual("profesores")}
            className={`flex items-center w-full p-3 rounded-2xl transition-all duration-200 ${vistaActual === "profesores" ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
          >
            <GraduationCap size={20} className="mr-3" />
            Profesores
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700/70 bg-slate-950/90">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 rounded-2xl hover:bg-red-600/20 text-red-400 transition-all duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
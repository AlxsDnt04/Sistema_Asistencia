import React from 'react';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

// Recibimos 'vistaActual' y 'setVistaActual'
export default function Sidebar({ usuario, onLogout, vistaActual, setVistaActual }) {
  
  // Función para poner mayúscula la primera letra del rol (profesor -> Profesor)
  const formatRol = (rol) => rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : 'Usuario';

  return (
    <div className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-2xl z-50">
      
      {/* Perfil del Profesor */}
      <div className="p-6 border-b border-slate-700 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold mb-3 border-4 border-slate-800">
          {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <h3 className="font-bold text-lg text-center">{usuario?.nombre || 'Usuario'}</h3>
        {/* Aquí mostramos el ROL dinámico */}
        <p className="text-xs text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-1 rounded mt-1">
            {usuario?.rol ? formatRol(usuario.rol) : 'DOCENTE'}
        </p>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-2">
        <button 
            onClick={() => setVistaActual('dashboard')}
            className={`flex items-center w-full p-3 rounded-lg transition-all ${vistaActual === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <LayoutDashboard size={20} className="mr-3" />
          Dashboard
        </button>

        <button 
            onClick={() => setVistaActual('alumnos')}
            className={`flex items-center w-full p-3 rounded-lg transition-all ${vistaActual === 'alumnos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Users size={20} className="mr-3" />
          Alumnos
        </button>

        <button 
            onClick={() => setVistaActual('reportes')}
            className={`flex items-center w-full p-3 rounded-lg transition-all ${vistaActual === 'reportes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <FileText size={20} className="mr-3" />
          Reportes
        </button>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button onClick={onLogout} className="flex items-center w-full p-3 hover:bg-red-600/20 text-red-400 rounded-lg transition-all">
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
import React from "react";
import { Power } from "lucide-react";

export default function QrScannerCard({ sesionActiva, deshabilitado, onIniciar, onTerminar, onVer }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h3 className="font-bold text-slate-800 text-lg">
          {sesionActiva ? "Registro de asistencia activo" : "Iniciar toma de asistencia"}
        </h3>
        <p className="text-sm text-slate-400">
          {sesionActiva
            ? "Los estudiantes pueden escanear el código QR dinámico desde sus dispositivos móviles."
            : "Genera un código QR de tiempo real para que los estudiantes registren su presencia."}
        </p>
      </div>

      {sesionActiva ? (
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={onVer} className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition cursor-pointer">
            Ver QR
          </button>
          <button onClick={onTerminar} className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer">
            <Power size={16} /> Finalizar Clase
          </button>
        </div>
      ) : (
        <button onClick={onIniciar} disabled={deshabilitado} className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer">
          <Power size={16} /> Iniciar QR Dinámico
        </button>
      )}
    </div>
  );
}
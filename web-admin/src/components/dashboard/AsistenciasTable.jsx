import React from "react";
import { Search } from "lucide-react";

export default function AsistenciasTable({ asistencias, filtro, setFiltro }) {
  return (
    <div className="bg-slate-50/90 rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-slate-800">
          Alumnos Registrados en esta Clase ({asistencias.length})
        </h3>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nombre o cédula..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-violet-500 font-medium"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-3">Estudiante</th>
              <th className="px-6 py-3">Cédula</th>
              <th className="px-6 py-3 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {asistencias.map((alumno, index) => (
              <tr key={alumno.id || index} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{alumno.nombre}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{alumno.cedula}</td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    Presente
                  </span>
                </td>
              </tr>
            ))}
            {asistencias.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-slate-400 italic">
                  Ningún alumno ha registrado asistencia en el filtro actual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
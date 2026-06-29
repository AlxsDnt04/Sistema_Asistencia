import React from "react";
import { Users, Clock } from "lucide-react";

const DonutChart = ({ presentes, total }) => {
  const validTotal = total > 0 ? total : 1;
  const porcentaje = Math.round((presentes / validTotal) * 100) || 0;
  const strokeDash = `${porcentaje}, 100`;
  const color = porcentaje < 50 ? "text-red-500" : porcentaje < 80 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path className={`${color} transition-all duration-500 ease-out`} strokeWidth="3.5" strokeDasharray={strokeDash} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-black text-slate-800 block">{porcentaje}%</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asist.</span>
      </div>
    </div>
  );
};

export default function LiveStatsCard({ matriculados, presentes }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-50/90 p-6 rounded-3xl border border-slate-200 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Matriculados</span>
          <span className="text-3xl font-black text-slate-800">{matriculados}</span>
        </div>
        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
          <Users size={24} />
        </div>
      </div>

      <div className="bg-slate-50/90 p-6 rounded-3xl border border-slate-200 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Presentes Hoy</span>
          <span className="text-3xl font-black text-emerald-600">{presentes}</span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Clock size={24} />
        </div>
      </div>

      <div className="bg-slate-50/90 p-6 rounded-3xl border border-slate-200 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Porcentaje General</span>
          <span className="text-sm text-slate-400 font-medium mt-1 block">Clase del día</span>
        </div>
        <DonutChart presentes={presentes} total={matriculados} />
      </div>
    </div>
  );
}
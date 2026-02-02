import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportesView() {
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                // Ajusta URL a tu backend
                const res = await axios.get('http://localhost:3000/api/asistencia/historial');
                setHistorial(res.data);
            } catch (error) {
                console.error("Error cargando historial", error);
            }
        };
        fetchHistorial();
    }, []);

    const exportarHistorialExcel = () => {
        const ws = XLSX.utils.json_to_sheet(historial);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial");
        XLSX.writeFile(wb, "Historial_Clases.xlsx");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Historial de Clases</h2>
                    <p className="text-slate-500">Registro de asistencia por días</p>
                </div>
                <button onClick={exportarHistorialExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <Download size={18} /> Exportar Todo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historial.map((dia, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                                <Calendar size={24} />
                            </div>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                {dia.fecha}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">{dia.total_asistentes}</h3>
                        <p className="text-slate-500 text-sm">Alumnos presentes</p>
                        
                        <button className="w-full mt-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                            Ver Detalles
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
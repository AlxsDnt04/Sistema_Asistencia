import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axiosConfig'; // Usamos tu instancia configurada
import { FileText, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext'; // Importamos el contexto global

export default function ReportesView() {
    // 1. CONSUMIMOS LAS MATERIAS Y EL USUARIO DESDE EL CONTEXTO GLOBAL
    const { user, misMaterias, loadingMaterias } = useContext(AuthContext);

    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [datosReporte, setDatosReporte] = useState(null);
    const [loading, setLoading] = useState(false);

    // Seleccionar automáticamente la primera materia disponible
    useEffect(() => {
        if (misMaterias && misMaterias.length > 0 && !materiaSeleccionada) {
            setMateriaSeleccionada(misMaterias[0].id);
        }
    }, [misMaterias, materiaSeleccionada]);

    // 2. PROCESAR Y ESTRUCTURAR LOS DATOS (Asegura compatibilidad con matrices y cálculos locales)
    const procesarDatosMatriz = (data) => {
        // Soporta tanto si el backend devuelve el objeto procesado como si devuelve la data cruda { asistencias, materia }
        const asistencias = data.asistencias || data;
        const materia = data.materia || misMaterias.find(m => m.id === materiaSeleccionada);

        if (!asistencias || !Array.isArray(asistencias)) {
            setDatosReporte(null);
            return;
        }

        // Obtener todas las fechas únicas y ordenarlas
        const fechasUnicas = [...new Set(asistencias.map(a => a.fecha))].sort();

        // Agrupar por estudiante
        const estudiantesMap = {};

        asistencias.forEach(asis => {
            const uid = asis.usuarioId;
            if (!estudiantesMap[uid]) {
                estudiantesMap[uid] = {
                    id: uid,
                    nombre: asis.Usuario?.nombre || 'Desconocido',
                    cedula: asis.Usuario?.cedula || 'S/N',
                    asistencias: {},
                    asistenciasCount: 0
                };
            }
            
            // Si está presente guardamos true y sumamos al contador local
            if (asis.presente || asis.estado === 'presente' || asis.id) { 
                estudiantesMap[uid].asistencias[asis.fecha] = true;
                estudiantesMap[uid].asistenciasCount += 1;
            }
        });

        const listaEstudiantes = Object.values(estudiantesMap).sort((a, b) => 
            a.nombre.localeCompare(b.nombre)
        );

        setDatosReporte({
            materia,
            fechas: fechasUnicas,
            totalDias: fechasUnicas.length,
            estudiantes: listaEstudiantes
        });
    };

    // 3. OBTENER REPORTE USANDO EL CLIENTE 'api'
    const obtenerReporte = useCallback(async () => {
        if (!materiaSeleccionada) return;
        setLoading(true);
        try {
            const res = await api.get(`/asistencia/reporte/${materiaSeleccionada}`);
            
            // Procesamos la data localmente para garantizar que la matriz dibuje los puntos/totales correctamente
            procesarDatosMatriz(res.data);
        } catch (error) {
            console.error("Error obteniendo reporte:", error);
            Swal.fire('Error', 'No se pudo obtener el reporte de esta materia.', 'error');
        } finally {
            setLoading(false);
        }
    }, [materiaSeleccionada, misMaterias]);

    useEffect(() => {
        obtenerReporte();
    }, [obtenerReporte]);

    // --- EXPORTAR A EXCEL ---
    const exportarExcel = () => {
        if (!datosReporte) return;

        const dataExcel = datosReporte.estudiantes.map((est, i) => {
            const row = {
                "No.": i + 1,
                "Estudiante": est.nombre,
                "Cédula": est.cedula
            };
            
            datosReporte.fechas.forEach(fecha => {
                row[fecha] = est.asistencias[fecha] ? "1" : "0";
            });

            row["Total Asistencias"] = est.asistenciasCount;
            row["% Asistencia"] = datosReporte.totalDias > 0 
                ? `${Math.round((est.asistenciasCount / datosReporte.totalDias) * 100)}%`
                : '0%';

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(dataExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
        XLSX.writeFile(wb, `Reporte_${datosReporte.materia?.nombre || 'Materia'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // --- EXPORTAR A PDF (Con Formato Institucional Vida Nueva) ---
    const exportarPDF = () => {
        if (!datosReporte) return;
        const doc = new jsPDF('l', 'mm', 'a4'); // Horizontal

        // Encabezado Institucional
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('INSTITUTO SUPERIOR TECNOLÓGICO "VIDA NUEVA"', 148, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('REPORTE DE ASISTENCIA CONSOLIDADO', 148, 22, { align: 'center' });

        // Recuadro de Información
        const infoX = 14;
        const infoY = 30;
        doc.setFontSize(9);
        doc.setLineWidth(0.1);
        doc.rect(infoX, infoY, 270, 20); 
        
        doc.text(`DOCENTE: ${datosReporte.materia?.Profesor?.nombre || user?.nombre || 'N/A'}`, infoX + 2, infoY + 6);
        doc.text(`ASIGNATURA: ${datosReporte.materia?.nombre || 'N/A'}`, infoX + 2, infoY + 12);
        doc.text(`CÓDIGO: ${datosReporte.materia?.codigo || 'S/N'}`, infoX + 2, infoY + 18);
        doc.text(`FECHA REPORTE: ${new Date().toLocaleDateString()}`, infoX + 200, infoY + 12);

        // Columnas y Filas para autoTable
        const columnas = [
            { header: 'N°', dataKey: 'index' },
            { header: 'Estudiante', dataKey: 'nombre' },
            ...datosReporte.fechas.map(fecha => ({ header: fecha.substring(5), dataKey: fecha })),
            { header: 'Total', dataKey: 'total' },
            { header: '%', dataKey: 'porcentaje' }
        ];

        const filas = datosReporte.estudiantes.map((est, i) => {
            const row = { index: i + 1, nombre: est.nombre };
            
            datosReporte.fechas.forEach(fecha => {
                row[fecha] = est.asistencias[fecha] ? '1' : '0'; 
            });

            row.total = est.asistenciasCount;
            const pct = datosReporte.totalDias > 0 
                ? Math.round((est.asistenciasCount / datosReporte.totalDias) * 100) 
                : 0;
            row.porcentaje = `${pct}%`;

            return row;
        });

        autoTable(doc, {
            startY: 55,
            head: [columnas.map(c => c.header)],
            body: filas.map(f => columnas.map(c => f[c.dataKey])),
            styles: { fontSize: 8, cellPadding: 1, halign: 'center' },
            columnStyles: { 1: { cellWidth: 60, halign: 'left' } },
            headStyles: { fillColor: [30, 41, 59] },
            theme: 'grid'
        });

        // Seccion de firmas al final de la página
        const finalY = doc.lastAutoTable.finalY + 35;
        if (finalY < 180) { 
            doc.line(40, finalY, 100, finalY);
            doc.text("FIRMA DEL DOCENTE", 70, finalY + 5, { align: 'center' });
            doc.line(180, finalY, 240, finalY);
            doc.text("COORDINADOR ACADÉMICO", 210, finalY + 5, { align: 'center' });
        }

        doc.save(`Reporte_${datosReporte.materia?.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            {/* Header / Selector */}
            <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Reportes de Asistencia</h2>
                        <p className="text-sm text-slate-500">Historial completo y exportación de asistencias de tus asignaturas.</p>
                    </div>
                </div>

                <div className="w-full md:w-72">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Seleccionar Curso</label>
                    {loadingMaterias ? (
                        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                    ) : (
                        <div className="relative">
                            <select 
                                className="w-full p-2.5 bg-white/80 border border-slate-200 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
                                value={materiaSeleccionada}
                                onChange={(e) => setMateriaSeleccionada(e.target.value)}
                            >
                                {misMaterias.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.codigo ? `${m.codigo} - ` : ''}{m.nombre}
                                    </option>
                                ))}
                                {misMaterias.length === 0 && <option value="">No hay cursos disponibles</option>}
                            </select>
                            <Filter className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones de exportación y Vista Previa */}
            {loading ? (
                <div className="bg-slate-50/90 rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-lg animate-pulse">
                    Generando matriz de asistencia...
                </div>
            ) : datosReporte && (
                <div className="bg-slate-50/90 rounded-3xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="font-bold text-slate-800">
                                Vista Previa: {datosReporte.materia?.nombre}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Días de clase registrados hasta hoy: {datosReporte.totalDias}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={exportarExcel} 
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition shadow-sm w-full sm:w-auto cursor-pointer"
                            >
                                <FileText size={16} /> Excel
                            </button>
                            <button 
                                onClick={exportarPDF} 
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-2xl hover:bg-slate-900 transition shadow-sm w-full sm:w-auto cursor-pointer"
                            >
                                <Download size={16} /> PDF
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-3 w-10 border-r text-center">#</th>
                                    <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 border-r min-w-[220px]">Estudiante / Cédula</th>
                                    {datosReporte.fechas.map(fecha => (
                                        <th key={fecha} className="px-2 py-3 text-center min-w-[65px] border-r bg-violet-50/30 font-mono text-[11px]">
                                            {fecha.split('-').slice(1).reverse().join('/')}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center bg-slate-100/80 font-bold text-slate-700 min-w-[80px]">Rend. %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {datosReporte.estudiantes.map((est, index) => (
                                    <tr key={est.id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 text-center border-r">{index + 1}</td>
                                        <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="font-semibold text-slate-900">{est.nombre}</div>
                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{est.cedula}</div>
                                        </td>
                                        {datosReporte.fechas.map(fecha => {
                                            const presente = est.asistencias[fecha];
                                            return (
                                                <td key={fecha} className="px-2 py-3 text-center border-r">
                                                    {presente ? (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 mx-auto" title="Presente"></div>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs font-light">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50/50">
                                            {datosReporte.totalDias > 0 ? Math.round((est.asistenciasCount / datosReporte.totalDias) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {datosReporte.estudiantes.length === 0 && (
                        <div className="p-12 text-center text-slate-400 italic">
                            No hay estudiantes con asistencia registrada en este curso.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
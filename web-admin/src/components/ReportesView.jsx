import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, Download, Filter, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

export default function ReportesView() {
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [datosReporte, setDatosReporte] = useState(null);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const cargarMaterias = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No hay token");
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Petición con el token
            const res = await axios.get('http://localhost:3000/api/materias', config);
            
            let misMaterias = res.data;
            
            // Si no es admin, filtramos solo las materias del profesor actual
            if (user.rol !== 'admin') {
                misMaterias = res.data.filter(m => m.profesorId === user.id);
            }
            
            setMaterias(misMaterias);

        } catch (error) {
            console.error("Error cargando materias", error);
            Swal.fire('Error', 'No se pudieron cargar los cursos', 'error');
        }
    }, [user.id, user.rol]);

    useEffect(() => {
        cargarMaterias();
    }, [cargarMaterias]);

    // 2. GENERAR REPORTE
    const generarReporte = async () => {
        if (!materiaSeleccionada) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Petición con el token
            const res = await axios.get(`http://localhost:3000/api/asistencia/reporte/${materiaSeleccionada}`, config);
            
            procesarDatosMatriz(res.data);
            
        } catch (error) {
            console.error("Error generando reporte", error);
            Swal.fire('Error', 'No se pudo generar el reporte. Verifique su conexión.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 3. PROCESAR DATOS 
    const procesarDatosMatriz = (data) => {
        const { asistencias, materia } = data;

        // A. Obtener todas las fechas únicas y ordenarlas
        const fechasUnicas = [...new Set(asistencias.map(a => a.fecha))].sort();

        // B. Agrupar por estudiante
        const estudiantesMap = {};

        asistencias.forEach(asis => {
            const uid = asis.usuarioId;
            // Si el estudiante no está en el mapa, lo inicializamos
            if (!estudiantesMap[uid]) {
                estudiantesMap[uid] = {
                    id: uid,
                    nombre: asis.Usuario?.nombre || 'Desconocido',
                    cedula: asis.Usuario?.cedula || 'S/N',
                    asistencias: {} 
                };
            }
            // Marcamos la asistencia en esa fecha
            estudiantesMap[uid].asistencias[asis.fecha] = true; 
        });

        // Convertimos el mapa a array
        const listaEstudiantes = Object.values(estudiantesMap).sort((a, b) => 
            a.nombre.localeCompare(b.nombre)
        );

        setDatosReporte({
            materia,
            fechas: fechasUnicas,
            estudiantes: listaEstudiantes
        });
    };

    // --- EXPORTAR A PDF ---
    const exportarPDF = () => {
        if (!datosReporte) return;
        const doc = new jsPDF('l', 'mm', 'a4'); // Horizontal

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('INSTITUTO SUPERIOR TECNOLÓGICO "VIDA NUEVA"', 148, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('REPORTE DE ASISTENCIA', 148, 22, { align: 'center' });

        const infoX = 14;
        const infoY = 30;
        doc.setFontSize(9);
        doc.setLineWidth(0.1);
        doc.rect(infoX, infoY, 270, 20); 
        
        doc.text(`DOCENTE: ${datosReporte.materia.Profesor?.nombre || user.nombre || 'N/A'}`, infoX + 2, infoY + 6);
        doc.text(`ASIGNATURA: ${datosReporte.materia.nombre}`, infoX + 2, infoY + 12);
        doc.text(`CÓDIGO: ${datosReporte.materia.codigo || 'S/N'}`, infoX + 2, infoY + 18);
        doc.text(`FECHA REPORTE: ${new Date().toLocaleDateString()}`, infoX + 200, infoY + 12);

        const columnas = [
            { header: 'N°', dataKey: 'index' },
            { header: 'Estudiante', dataKey: 'nombre' },
            ...datosReporte.fechas.map(fecha => ({ header: fecha.substring(5), dataKey: fecha })),
            { header: 'Total', dataKey: 'total' },
            { header: '%', dataKey: 'porcentaje' }
        ];

        const filas = datosReporte.estudiantes.map((est, i) => {
            const row = { index: i + 1, nombre: est.nombre };
            let totalAsistencias = 0;

            datosReporte.fechas.forEach(fecha => {
                const presente = est.asistencias[fecha];
                row[fecha] = presente ? '•' : ''; 
                if (presente) totalAsistencias++;
            });

            row.total = totalAsistencias;
            const pct = datosReporte.fechas.length > 0 
                ? Math.round((totalAsistencias / datosReporte.fechas.length) * 100) 
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
            theme: 'grid'
        });

        const finalY = doc.lastAutoTable.finalY + 40;
        if (finalY < 180) { // Solo si cabe en la página
            doc.line(40, finalY, 100, finalY);
            doc.text("FIRMA DEL DOCENTE", 70, finalY + 5, { align: 'center' });
            doc.line(180, finalY, 240, finalY);
            doc.text("COORDINADOR ACADÉMICO", 210, finalY + 5, { align: 'center' });
        }

        doc.save(`Reporte_${datosReporte.materia.nombre}.pdf`);
    };

    // --- EXPORTAR A EXCEL ---
    const exportarExcel = () => {
        if (!datosReporte) return;

        const dataExcel = datosReporte.estudiantes.map((est, i) => {
            const row = {
                "No.": i + 1,
                "Estudiante": est.nombre,
                "Cédula": est.cedula
            };
            
            let total = 0;
            datosReporte.fechas.forEach(fecha => {
                const asiste = est.asistencias[fecha] ? 1 : 0;
                row[fecha] = asiste;
                total += asiste;
            });

            row["Total Asistencias"] = total;
            row["% Asistencia"] = datosReporte.fechas.length > 0 
                ? ((total / datosReporte.fechas.length) * 100).toFixed(2) + '%' 
                : '0%';

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(dataExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
        XLSX.writeFile(wb, `Reporte_${datosReporte.materia.nombre}.xlsx`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            
            {/* Header y Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Generador de Reportes</h2>
                    <p className="text-slate-500">Selecciona una materia para generar la matriz de asistencia.</p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <select 
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-700"
                            value={materiaSeleccionada}
                            onChange={(e) => setMateriaSeleccionada(e.target.value)}
                        >
                            <option value="">-- Seleccionar Curso --</option>
                            {materias.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.codigo ? `${m.codigo} - ` : ''}{m.nombre}
                                </option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button 
                        onClick={generarReporte}
                        disabled={!materiaSeleccionada || loading}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        {loading ? 'Cargando...' : <><Search size={18}/> Generar</>}
                    </button>
                </div>
            </div>

            {/* Vista Previa */}
            {datosReporte && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="p-4 border-b bg-slate-50 flex justify-between items-center flex-wrap gap-2">
                        <h3 className="font-semibold text-slate-700">
                            Vista Previa: {datosReporte.materia.nombre}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={exportarExcel} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                                <FileText size={16} /> Excel
                            </button>
                            <button onClick={exportarPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
                                <Download size={16} /> PDF
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 w-10 border-r">#</th>
                                    <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 shadow-sm border-r min-w-[200px]">Estudiante</th>
                                    {datosReporte.fechas.map(fecha => (
                                        <th key={fecha} className="px-2 py-3 text-center min-w-[50px] border-r">
                                            {fecha.substring(5)}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center bg-slate-100">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosReporte.estudiantes.map((est, index) => {
                                    const totalDias = datosReporte.fechas.length;
                                    let asistenciasCount = 0;
                                    
                                    return (
                                        <tr key={est.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-500 border-r">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white z-10 shadow-sm border-r">
                                                {est.nombre}
                                            </td>
                                            {datosReporte.fechas.map(fecha => {
                                                const presente = est.asistencias[fecha];
                                                if(presente) asistenciasCount++;
                                                return (
                                                    <td key={fecha} className="px-2 py-3 text-center border-r">
                                                        {presente ? (
                                                            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto"></div>
                                                        ) : (
                                                            <span className="text-slate-200 text-xs">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50">
                                                {totalDias > 0 ? Math.round((asistenciasCount/totalDias)*100) : 0}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {datosReporte.estudiantes.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No hay estudiantes con asistencia registrada en este curso.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
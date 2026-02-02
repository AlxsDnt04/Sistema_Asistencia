import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export default function AlumnosView() {
    const [alumnos, setAlumnos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const porPagina = 5; 

    // Cargar datos 
    useEffect(() => {
        const fetchAlumnos = async () => {
            try {
                // la URL backend
                const res = await axios.get('http://localhost:3000/api/auth/alumnos');
                console.log("Datos recibidos:", res.data);
                setAlumnos(res.data);
            } catch (error) {
                console.error("Error cargando alumnos", error);
            }
        };
        fetchAlumnos();
    }, []);

    // Lógica de búsqueda y paginación
    const filtrados = alumnos.filter(a => 
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        a.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    const maxPaginas = Math.ceil(filtrados.length / porPagina);
    const inicio = (pagina - 1) * porPagina;
    const alumnosPaginados = filtrados.slice(inicio, inicio + porPagina);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Alumnos</h2>
                    <p className="text-slate-500">Administra el acceso de los estudiantes</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-900/20">
                    <UserPlus size={20} /> Nuevo Alumno
                </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {alumnosPaginados.length > 0 ? (
                            alumnosPaginados.map((alumno) => (
                                <tr key={alumno.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {alumno.nombre.charAt(0)}
                                        </div>
                                        {alumno.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{alumno.email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">No se encontraron alumnos</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Mostrando {inicio + 1} - {Math.min(inicio + porPagina, filtrados.length)} de {filtrados.length}</span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        className="p-2 border rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={() => setPagina(p => Math.min(maxPaginas, p + 1))}
                        disabled={pagina === maxPaginas}
                        className="p-2 border rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
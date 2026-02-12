import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, X, Save, User, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function MateriasView() {
    const [materias, setMaterias] = useState([]);
    const [profesores, setProfesores] = useState([]); 
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const esAdmin = user.rol === 'admin'; 

    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        codigo: '',
        profesorId: '' 
    });

    // 1. FUNCIÓN CARGAR DATOS
    const cargarDatos = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const usuarioStorage = JSON.parse(localStorage.getItem('user') || '{}');
            const soyAdmin = usuarioStorage.rol === 'admin';

            // A. Cargar Materias
            const resMaterias = await axios.get('http://localhost:3000/api/materias', config);
            setMaterias(resMaterias.data);

            // B. Si es Admin, cargar profesores (Ahora funcionará con la nueva ruta)
            if (soyAdmin) {
                const resUsers = await axios.get('http://localhost:3000/api/usuarios', config);
                // Filtramos usuarios que sean docentes o profesores
                const listaProfes = resUsers.data.filter(u => u.rol === 'docente' || u.rol === 'profesor');
                setProfesores(listaProfes);
            }
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    }, []); 

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarDatos();
    }, [cargarDatos]);

    
    // -------------------------------------------------------------------------
    // MANEJO DEL FORMULARIO
    // -------------------------------------------------------------------------
    const abrirModal = (materia = null) => {
        if (materia) {
            setModoEdicion(true);
            setFormData({ 
                id: materia.id,
                nombre: materia.nombre,
                codigo: materia.codigo,
                profesorId: materia.profesorId || '' 
            });
        } else {
            setModoEdicion(false);
            setFormData({ 
                id: null, 
                nombre: '', 
                codigo: '', 
                profesorId: esAdmin ? '' : user.id 
            });
        }
        setModalAbierto(true);
    };

    const guardarMateria = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (esAdmin && !formData.profesorId) {
            return Swal.fire('Atención', 'Debes asignar un profesor a la materia', 'warning');
        }

        try {
            if (modoEdicion) {
                await axios.put(`http://localhost:3000/api/materias/${formData.id}`, formData, config);
                Swal.fire('Actualizado', 'La materia ha sido actualizada', 'success');
            } else {
                await axios.post('http://localhost:3000/api/materias', formData, config);
                Swal.fire('Creado', 'Materia creada exitosamente', 'success');
            }
            setModalAbierto(false);
            cargarDatos(); 
        } catch (error) {
            console.error("Error guardando", error);
            Swal.fire('Error', 'Hubo un problema al guardar', 'error');
        }
    };

    const eliminarMateria = async (id) => {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará la materia y su historial de asistencia.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3000/api/materias/${id}`, config);
                Swal.fire('Eliminado', 'La materia ha sido eliminada.', 'success');
                cargarDatos(); 
            } catch (error) {
                console.error("Error eliminando", error);
                Swal.fire('Error', 'No se pudo eliminar la materia', 'error');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative p-6">
            {/* Cabecera */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Cursos</h2>
                    <p className="text-slate-500">
                        {esAdmin 
                            ? 'Administración total de materias y asignaciones' 
                            : 'Tus materias asignadas'}
                    </p>
                </div>
                
                {esAdmin && (
                    <button 
                        onClick={() => abrirModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg"
                    >
                        <Plus size={20} /> Nuevo Curso
                    </button>
                )}
            </div>

            {/* Grid de Tarjetas */}
            {materias.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400">No hay materias registradas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materias.map((materia) => {
                        // LOGICA VISUAL PARA CURSOS SIN ASIGNAR
                        // Si no tiene profesor ID, es "sin asignar"
                        const sinAsignar = !materia.profesorId;
                        
                        return (
                            <div 
                                key={materia.id} 
                                className={`
                                    p-6 rounded-xl shadow-sm border transition relative group
                                    ${sinAsignar && esAdmin 
                                        ? 'bg-red-50 border-red-300 animate-pulse' // Efecto rojizo y movimiento
                                        : 'bg-white border-slate-200 hover:shadow-md'
                                    }
                                `}
                            >
                                {/* Botones de acción solo para Admin */}
                                {esAdmin && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-200 z-10">
                                        <button onClick={() => abrirModal(materia)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => eliminarMateria(materia.id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition">
                                            <Trash2 size={16} />
                                        </button>

                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`
                                        w-12 h-12 rounded-lg flex items-center justify-center shadow-inner
                                        ${sinAsignar && esAdmin ? 'bg-red-200 text-red-600' : 'bg-indigo-100 text-indigo-600'}
                                    `}>
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{materia.nombre}</h3>
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">
                                            {materia.codigo}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className={`
                                    text-sm mt-4 pt-4 border-t flex items-center gap-2
                                    ${sinAsignar && esAdmin ? 'border-red-200 text-red-600 font-bold' : 'border-slate-100 text-slate-500'}
                                `}>
                                    {sinAsignar ? (
                                        <>
                                            <AlertCircle size={16} />
                                            <span>¡Requiere Profesor!</span>
                                        </>
                                    ) : (
                                        <>
                                            <User size={14} className="text-slate-400" />
                                            <span className="font-medium">
                                                {materia.profesor ? materia.profesor.nombre : 'Cargando...'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm transition-all">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modoEdicion ? 'Editar Curso' : 'Crear Nuevo Curso'}
                            </h3>
                            <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={guardarMateria} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Materia</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 transition"
                                    placeholder="Ej: Base de Datos I"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código (Sigla)</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 transition"
                                    placeholder="Ej: SIS-123"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                                />
                            </div>

                            {esAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Profesor Asignado</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 bg-white appearance-none cursor-pointer"
                                            value={formData.profesorId}
                                            onChange={(e) => setFormData({...formData, profesorId: e.target.value})}
                                            required
                                        >
                                            <option value="">-- Seleccionar Profesor --</option>
                                            {profesores.map((profe) => (
                                                <option key={profe.id} value={profe.id}>
                                                    {profe.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex justify-center gap-2 mt-4 shadow-md hover:shadow-lg">
                                <Save size={20} /> Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
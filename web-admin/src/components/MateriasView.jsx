import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axiosConfig'; // cliente configurado
import { BookOpen, Plus, Edit, Trash2, X, Save, User, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext'; // Importamos el contexto global

export default function MateriasView() {
    // 1. CONSUMIMOS DATOS GLOBALES Y LA FUNCIÓN DE REFREZCO
    const { user, recargarMaterias } = useContext(AuthContext);
    const esAdmin = user?.rol === 'admin'; 

    const [materias, setMaterias] = useState([]);
    const [profesores, setProfesores] = useState([]); 
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        codigo: '',
        profesorId: '' 
    });
    const [busqueda, setBusqueda] = useState('');

    // 2. FUNCIÓN CARGAR DATOS GENERALES CON INSTANCIA 'api'
    const cargarDatos = useCallback(async () => {
        try {
            // Cargar Materias 
            const resMaterias = await api.get('/materias');
            setMaterias(resMaterias.data);

            // Si es administrador, cargamos la lista de profesores para asignación
            if (esAdmin) {
                const resUsuarios = await api.get('/usuarios');
                const profesFiltrados = resUsuarios.data.filter(u => u.rol === 'profesor');
                setProfesores(profesFiltrados);
            }
        } catch (error) {
            console.error("Error al cargar datos en MateriasView:", error);
        }
    }, [esAdmin]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, nombre: '', codigo: '', profesorId: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (materia) => {
        setModoEdicion(true);
        setFormData({
            id: materia.id,
            nombre: materia.nombre,
            codigo: materia.codigo,
            profesorId: materia.profesorId?.id || materia.profesorId || ''
        });
        setModalAbierto(true);
    };

    // 3. ENVÍO DEL FORMULARIO (Crear / Editar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await api.put(`/materias/${formData.id}`, {
                    nombre: formData.nombre,
                    codigo: formData.codigo,
                    profesorId: esAdmin ? formData.profesorId : undefined 
                });
                Swal.fire('¡Actualizado!', 'Curso modificado de manera correcta.', 'success');
            } else {
                await api.post('/materias', {
                    nombre: formData.nombre,
                    codigo: formData.codigo,
                    profesorId: esAdmin ? formData.profesorId : user.id 
                });
                Swal.fire('¡Creado!', 'Nuevo curso registrado correctamente.', 'success');
            }
            
            setModalAbierto(false);
            cargarDatos();
            recargarMaterias(); // NOTIFICAMOS AL CONTEXTO GLOBAL PARA SINCRONIZAR TODA LA APP
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Ocurrió un error inesperado.', 'error');
        }
    };

    // 4. ELIMINAR CURSO
    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará el curso de forma permanente y se desmatriculará a los alumnos.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/materias/${id}`);
                Swal.fire('¡Eliminado!', 'El curso ha sido removido.', 'success');
                cargarDatos();
                recargarMaterias(); // REFRESCAMOS SELECTORES GLOBALES
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el curso.', 'error');
            }
        }
    };

    const obtenerNombreProfesor = (materia) => {
        if (!materia.profesorId) return 'Sin asignar';
        if (typeof materia.profesorId === 'object') return materia.profesorId.nombre || 'Sin asignar';

        const profesor = profesores.find((p) => p.id === materia.profesorId);
        return profesor?.nombre || 'Sin asignar';
    };

    const materiasFiltradas = materias.filter((materia) => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return true;
        return (
            materia.nombre.toLowerCase().includes(termino) ||
            materia.codigo.toLowerCase().includes(termino)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Control de Cursos / Materias</h2>
                        <p className="text-sm text-slate-500">
                            {esAdmin ? 'Administrador global del catálogo' : 'Tus materias asignadas'}
                        </p>
                    </div>
                </div>

                {esAdmin && (
                    <button onClick={abrirModalCrear} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition shadow-sm hover:shadow cursor-pointer">
                        <Plus size={20} /> Crear Nueva Materia
                    </button>
                )}
            </div>

            {/* Buscador de materias */}
            <div className="bg-slate-50/90 p-6 rounded-3xl shadow-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Buscar materias</label>
                <input
                    type="text"
                    placeholder="Buscar por código o nombre"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white/80 focus:border-violet-500 outline-none text-slate-700"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Listado de Cursos en Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/90 border border-slate-200 p-6 rounded-3xl">
                {materiasFiltradas.map((materia) => (
                    <div key={materia.id} className="bg-white/95 rounded-3xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between relative group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                                    {materia.codigo}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">
                                {materia.nombre}
                            </h3>
                            {esAdmin && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                                    <User size={14} className="text-violet-400" />
                                    <span>Profesor: <b>{obtenerNombreProfesor(materia)}</b></span>
                                </div>
                            )}
                        </div>

                        {esAdmin && (
                            <div className="flex gap-2 justify-end mt-6">
                                <button onClick={() => abrirModalEditar(materia)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition cursor-pointer" title="Editar">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleEliminar(materia.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Eliminar">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {materiasFiltradas.length === 0 && (
                    <div className="col-span-full bg-slate-50/90 p-12 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">
                        {busqueda ? 'No hay materias que coincidan con la búsqueda.' : 'No hay materias registradas en este momento.'}
                    </div>
                )}
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-slate-50/95 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative">
                        <button onClick={() => setModalAbierto(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            {modoEdicion ? 'Editar Curso' : 'Registrar Nuevo Curso'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Materia</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Estructuras de Datos"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-medium text-slate-700"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código único del curso</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. ED-001"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-medium text-slate-700 uppercase"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                                    required
                                />
                            </div>

                            {esAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Asignar Docente</label>
                                    <select 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 outline-none focus:border-violet-500 cursor-pointer"
                                        value={formData.profesorId}
                                        onChange={(e) => setFormData({...formData, profesorId: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Seleccionar Profesor --</option>
                                        {profesores.map((profe) => (
                                            <option key={profe.id} value={profe.id}>{profe.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 bg-violet-600 text-white py-2 rounded-2xl font-bold hover:bg-violet-700 transition flex justify-center items-center gap-2 shadow-sm cursor-pointer">
                                    <Save size={18} /> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
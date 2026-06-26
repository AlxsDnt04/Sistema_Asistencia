import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig'; // Cambiado a tu cliente configurado inteligente
import { User, Plus, Edit, Trash2, X, Save, Search, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProfesoresView() {
    const [profesores, setProfesores] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

    // Formulario
    const [formData, setFormData] = useState({
        id: null,
        cedula: '',
        nombre: '',
        email: '',
        password: '', // Solo se envía si se cambia
        rol: 'profesor'
    });

    // 1. CARGAR DOCENTES USANDO INSTANCIA 'api' (Sin headers manuales)
    const cargarProfesores = useCallback(async () => {
        try {
            const res = await api.get('/usuarios');
            // Ordenar por ID descendente para ver los nuevos primero
            const ordenados = res.data.sort((a, b) => b.id - a.id);
            setProfesores(ordenados);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            Swal.fire('Error', 'No se pudo obtener la lista de usuarios.', 'error');
        }
    }, []);

    useEffect(() => {
        cargarProfesores();
    }, [cargarProfesores]);

    // 2. CREAR O EDITAR USUARIO / DOCENTE
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                // Estructurar el cuerpo de actualización
                const updateData = {
                    cedula: formData.cedula,
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: formData.rol
                };
                // Solo adjuntar contraseña si el administrador escribió algo nuevo
                if (formData.password.trim() !== '') {
                    updateData.password = formData.password;
                }

                await api.put(`/usuarios/${formData.id}`, updateData);
                Swal.fire('¡Actualizado!', 'Los datos del usuario han sido modificados.', 'success');
            } else {
                // Crear nuevo usuario obligatoriamente con contraseña
                if (!formData.password) {
                    return Swal.fire('Atención', 'La contraseña es obligatoria para nuevos registros.', 'warning');
                }
                await api.post('/usuarios', formData);
                Swal.fire('¡Registrado!', 'El nuevo usuario ha sido creado con éxito.', 'success');
            }

            setModalAbierto(false);
            cargarProfesores();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Ocurrió un error en el servidor.', 'error');
        }
    };

    // 3. ELIMINAR USUARIO / DOCENTE
    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará al usuario. Si es un profesor, sus materias quedarán huérfanas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/usuarios/${id}`);
                Swal.fire('¡Eliminado!', 'El usuario ha sido removido del sistema.', 'success');
                cargarProfesores();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar al usuario seleccionado.', 'error');
            }
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, cedula: '', nombre: '', email: '', password: '', rol: 'profesor' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (profe) => {
        setModoEdicion(true);
        setFormData({
            id: profe.id,
            cedula: profe?.cedula ?? '',
            nombre: profe.nombre,
            email: profe.email,
            password: '', // Vacío por seguridad en edición
            rol: profe.rol
        });
        setModalAbierto(true);
    };

    // Filtro de búsqueda en tiempo real
    const profesoresFiltrados = profesores.filter(p => 
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        (p.cedula?.toString().includes(filtro) ?? false) ||
        p.email.toLowerCase().includes(filtro.toLowerCase())
    );

    // Cálculos lógicos de paginación
    const totalPaginas = Math.ceil(profesoresFiltrados.length / itemsPorPagina);
    const indiceUltimoItem = paginaActual * itemsPorPagina;
    const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
    const profesoresPaginados = profesoresFiltrados.slice(indicePrimerItem, indiceUltimoItem);

    return (
        <div className="space-y-6">
            {/* Encabezado Principal */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Administración de Personal</h2>
                        <p className="text-sm text-slate-500">Gestión global de Docentes y Administradores</p>
                    </div>
                </div>

                <button onClick={abrirModalCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm cursor-pointer">
                    <Plus size={20} /> Registrar Personal
                </button>
            </div>

            {/* Tabla de Registros */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={18} className="text-blue-500" /> Lista de Usuarios ({profesoresFiltrados.length})
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, cédula..."
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium"
                            value={filtro}
                            onChange={(e) => { setFiltro(e.target.value); setPaginaActual(1); }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Nombre Completo</th>
                                <th className="px-6 py-3">Cédula</th>
                                <th className="px-6 py-3">Rol del Sistema</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {profesoresPaginados.map((profe) => (
                                <tr key={profe.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{profe.nombre}</div>
                                        <div className="text-xs text-slate-400">{profe.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{profe.cedula ?? 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            profe.rol === 'admin' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {profe.rol === 'admin' ? 'Administrador' : 'Docente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button onClick={() => abrirModalEditar(profe)} className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Editar">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleEliminar(profe.id)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Eliminar">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {profesoresFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                                        No se encontraron usuarios registrados en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Controles de Paginación */}
                {totalPaginas > 1 && (
                    <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaActual === 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 transition cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                                disabled={paginaActual === totalPaginas}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 transition cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={() => setModalAbierto(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            {modoEdicion ? 'Editar Información General' : 'Registrar Nuevo Personal'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cédula</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. 1726354758"
                                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium text-slate-700 ${modoEdicion ? 'bg-slate-100 cursor-not-allowed' : 'focus:border-blue-500'}`}
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                                    disabled={modoEdicion}
                                    required
                                />
                                {modoEdicion && (
                                    <p className="text-xs text-slate-400 mt-1">La cédula se conserva y no puede modificarse desde esta vista.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Ing. Carlos Pérez"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-700"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    placeholder="ejemplo@correo.com"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-700"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {modoEdicion ? 'Contraseña (Dejar en blanco para conservar)' : 'Contraseña de Acceso'}
                                </label>
                                <input 
                                    type="password" 
                                    placeholder={modoEdicion ? "********" : "Mínimo 6 caracteres"}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-700"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required={!modoEdicion}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol Operativo</label>
                                <select 
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                >
                                    <option value="profesor">Docente / Profesor</option>
                                    <option value="admin">Administrador global</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer font-medium">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-sm cursor-pointer">
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
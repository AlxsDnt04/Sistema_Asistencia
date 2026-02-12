import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    // Cargar datos
    const cargarProfesores = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3000/api/usuarios', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ordenar por ID descendente para ver los nuevos primero
            const ordenados = res.data.sort((a, b) => b.id - a.id);
            setProfesores(ordenados);
        } catch (error) {
            console.error("Error cargando profesores", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarProfesores();
    }, []);

    // Manejo del Modal
    const abrirModal = (profe = null) => {
        if (profe) {
            setModoEdicion(true);
            setFormData({ 
                id: profe.id, 
                cedula: profe.cedula,
                nombre: profe.nombre, 
                email: profe.email, 
                rol: profe.rol,
                password: '' // No mostramos la contraseña actual por seguridad
            });
        } else {
            setModoEdicion(false);
            setFormData({ id: null, cedula: '', nombre: '', email: '', password: '', rol: 'profesor' });
        }
        setModalAbierto(true);
    };

    // Guardar (Crear o Editar)
    const guardarProfesor = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (modoEdicion) {
                // Si password va vacío, el backend no lo actualiza
                await axios.put(`http://localhost:3000/api/usuarios/${formData.id}`, formData, config);
                Swal.fire('Actualizado', 'Datos actualizados correctamente', 'success');
            } else {
                if (!formData.password) {
                    return Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios', 'warning');
                }
                await axios.post('http://localhost:3000/api/usuarios', formData, config);
                Swal.fire('Creado', 'Profesor registrado correctamente', 'success');
            }
            setModalAbierto(false);
            cargarProfesores();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Hubo un error al guardar', 'error');
        }
    };

    // Eliminar
    const eliminarProfesor = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto. Si tiene materias asignadas, podría causar errores.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                cargarProfesores();
            } catch {
                Swal.fire('Error', 'No se pudo eliminar. Verifique que no tenga materias asignadas.', 'error');
            }
        }
    };

    // Filtrado y Paginación
    const profesoresFiltrados = profesores.filter(p => 
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.email.toLowerCase().includes(filtro.toLowerCase())
    );

    const indiceUltimoItem = paginaActual * itemsPorPagina;
    const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
    const itemsActuales = profesoresFiltrados.slice(indicePrimerItem, indiceUltimoItem);
    const totalPaginas = Math.ceil(profesoresFiltrados.length / itemsPorPagina);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="text-blue-600" /> Administración de Profesores
                    </h2>
                    <p className="text-slate-500">Gestiona los accesos de docentes y administradores</p>
                </div>
                <button 
                    onClick={() => abrirModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg"
                >
                    <Plus size={20} /> Nuevo Usuario
                </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input 
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    className="w-full outline-none text-slate-700"
                    value={filtro}
                    onChange={(e) => { setFiltro(e.target.value); setPaginaActual(1); }}
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {itemsActuales.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No se encontraron registros.</td></tr>
                            ) : (
                                itemsActuales.map((profe) => (
                                    <tr key={profe.id} className="hover:bg-blue-50/30 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                {profe.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            {profe.nombre}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                profe.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {profe.rol.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{profe.email}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => abrirModal(profe)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => eliminarProfesor(profe.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {profesoresFiltrados.length > itemsPorPagina && (
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                        <button 
                            disabled={paginaActual === 1}
                            onClick={() => setPaginaActual(prev => prev - 1)}
                            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm text-slate-500">
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button 
                            disabled={paginaActual === totalPaginas}
                            onClick={() => setPaginaActual(prev => prev + 1)}
                            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm transition-all">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={guardarProfesor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cédula</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                                    placeholder="Ej: 1712345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Contraseña {modoEdicion && <span className="text-xs text-slate-400 font-normal">(Dejar en blanco para mantener actual)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                    placeholder={modoEdicion ? "********" : "Nueva contraseña"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                >
                                    <option value="profesor">Profesor / Docente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center gap-2 mt-4 shadow-md">
                                <Save size={20} /> Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
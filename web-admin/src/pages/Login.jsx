import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react'; // Iconos
import api from '../api/axiosConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.usuario.rol !== 'profesor') {
        setError('Acceso denegado: Solo personal docente.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch {
      setError('Credenciales incorrectas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Tarjeta con efecto Glass */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-gray-400">Sistema de Asistencia Docente</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-gray-300 text-sm font-medium ml-1">Correo Institucional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="profesor@universidad.edu"
                className="w-full bg-gray-900/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 text-sm font-medium ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-900/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
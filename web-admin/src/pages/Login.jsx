import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig"; // ruta 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Usamos la función del contexto

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. Petición al backend
      const response = await api.post("/auth/login", { email, password });
      
      const { usuario, token } = response.data;

      // 2. Validación de Rol (Seguridad Frontend)
      if (usuario.rol !== "profesor" && usuario.rol !== "admin") {
        setError("Acceso denegado: Solo personal docente o administrativo.");
        setLoading(false);
        return;
      }

      // 3. Usar la función login del Contexto
      // (Ella se encarga de guardar en localStorage y actualizar el estado global)
      login(usuario, token);

      // 4. Redireccionar
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      // Mensaje de error más amigable según el código
      if (err.response && err.response.status === 401) {
        setError("Credenciales incorrectas.");
      } else if (err.response && err.response.status === 404) {
        setError("Usuario no encontrado.");
      } else {
        setError("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-gray-400">Sistema de Asistencia Docente</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm animate-pulse">
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
                required
                placeholder="docente@universidad.edu"
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
                required
                placeholder="••••••••"
                className="w-full bg-gray-900/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 mt-4 
              ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white'}`}
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
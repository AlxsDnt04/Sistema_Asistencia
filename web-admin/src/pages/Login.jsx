import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ChevronRight, AlertCircle, Eye, EyeOff, GraduationCap } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await api.post("/auth/login", { email, password });
      const { usuario, token } = response.data;

      if (usuario.rol !== "profesor" && usuario.rol !== "admin") {
        setError("Acceso denegado: Solo personal docente o administrativo.");
        setLoading(false);
        return;
      }

      login(usuario, token);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decoraciones de fondo con gradientes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Card principal con Glassmorphism */}
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Efecto de glow detrás de la tarjeta */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />
          
          {/* Tarjeta glassmorphism */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-blue-400/20">
                  <GraduationCap className="text-blue-400" size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
                Bienvenido
              </h1>
              <p className="text-slate-300 text-sm font-medium tracking-wide">
                Sistema de Asistencia Docente
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 backdrop-blur-sm text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm animate-in fade-in duration-300">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-slate-200 text-sm font-semibold block ml-0.5">
                  Correo Institucional
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 rounded-xl transition-all duration-300" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    placeholder="docente@universidad.edu"
                    className="w-full relative bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-400/50 text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-300 backdrop-blur-sm placeholder-slate-500 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-slate-200 text-sm font-semibold block ml-0.5">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 rounded-xl transition-all duration-300" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full relative bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-400/50 text-white pl-12 pr-12 py-3 rounded-xl outline-none transition-all duration-300 backdrop-blur-sm placeholder-slate-500 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={20} strokeWidth={1.5} />
                    ) : (
                      <Eye size={20} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-3 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 mt-8 relative overflow-hidden group
                  ${
                    loading
                      ? "bg-slate-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  }`}
              >
                {/* Efecto de brillo */}
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
                <span className="relative">
                  {loading ? "Verificando..." : "Iniciar Sesión"}
                </span>
                {!loading && <ChevronRight size={20} strokeWidth={2.5} className="relative" />}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
              <span className="text-xs text-slate-400 font-medium">O</span>
              <div className="flex-1 h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">
                ¿Necesitas ayuda?
              </p>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
                Contacta al administrador
              </a>
            </div>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-slate-500 text-xs mt-6 font-medium tracking-wide">
          Credenciales seguras • Acceso restringido a personal docente
        </p>
      </div>
    </div>
  );
}
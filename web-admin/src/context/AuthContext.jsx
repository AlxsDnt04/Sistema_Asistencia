import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosConfig"; // Importamos tu instancia de axios configurada

// Evita el error de Fast Refresh en Vite
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS GLOBALES DE MATERIAS ---
  const [misMaterias, setMisMaterias] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(true);

  // Función optimizada para cargar las materias del usuario autenticado
  const cargarMateriasGlobales = useCallback(async (usuarioActual) => {
    if (!usuarioActual) return;
    try {
      setLoadingMaterias(true);
      // Usamos 'api' que ya maneja la URL base y el token automáticamente
      const res = await api.get("/materias");
      
      // Filtrado según el rol: El admin ve todo, el profesor solo las suyas
      const cursos = usuarioActual.rol === "admin"
        ? res.data
        : res.data.filter((m) => m.profesorId === usuarioActual.id);
        
      setMisMaterias(cursos);
    } catch (error) {
      console.error("Error cargando materias en el contexto global:", error);
    } finally {
      setLoadingMaterias(false);
    }
  }, []);

  useEffect(() => {
    // Verificar sesión al cargar la app
    const checkLogin = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Cargamos las materias inmediatamente si existe una sesión válida
          await cargarMateriasGlobales(parsedUser);
        } catch (error) {
          console.error("Error parseando usuario", error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, [cargarMateriasGlobales]);

  const login = async (userData, token) => {
    // 1. Guardar en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // 2. Actualizar estado del usuario
    setUser(userData);

    // 3. Cargar sus materias de forma reactiva
    await cargarMateriasGlobales(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMisMaterias([]); // Limpiamos las materias globales al salir
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        // --- EXPORTAMOS VALORES AL RESTO DE LA APP ---
        misMaterias,
        loadingMaterias,
        recargarMaterias: () => cargarMateriasGlobales(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
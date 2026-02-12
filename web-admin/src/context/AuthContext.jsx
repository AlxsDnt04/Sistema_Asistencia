import { createContext, useState, useEffect } from "react";

// Evita el error de Fast Refresh en Vite
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión al cargar la app
    const checkLogin = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parseando usuario", error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  const login = (userData, token) => {
    // 1. Guardar en localStorage (Centralizado aquí)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // 2. Actualizar estado
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
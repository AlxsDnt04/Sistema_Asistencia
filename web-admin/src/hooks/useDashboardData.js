import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import api from "../api/axiosConfig";

// Inicializar Socket con el backend
const socket = io("http://localhost:3000", {
  withCredentials: true
});

export default function useDashboardData() {
  const context = useContext(AuthContext);
  
  const user = context?.user || null;
  const logout = context?.logout || (() => {});
  const misMaterias = context?.misMaterias || [];
  const loadingMaterias = context?.loadingMaterias ?? false;

  const [vistaActual, setVistaActual] = useState("dashboard");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [sesionActiva, setSesionActiva] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [alumnosMatriculados, setAlumnosMatriculados] = useState([]);
  const [asistenciasEnVivo, setAsistenciasEnVivo] = useState([]);
  const [totalMatriculados, setTotalMatriculados] = useState(0);
  const [modalQrAbierto, setModalQrAbierto] = useState(false);
  const [filtroAsistencia, setFiltroAsistencia] = useState("");

  // 1. Asignar de forma reactiva la primera materia disponible al cargar
  useEffect(() => {
    if (misMaterias && misMaterias.length > 0) {
      const existe = misMaterias.some(m => String(m.id) === String(materiaSeleccionada));
      if (!materiaSeleccionada || !existe) {
        setMateriaSeleccionada(misMaterias[0].id);
      }
    }
  }, [misMaterias, materiaSeleccionada]);

  // 2. Escuchar los Sockets en tiempo real cuando un estudiante escanea
  useEffect(() => {
    if (!materiaSeleccionada) return;

    socket.emit("join-room", `curso_${materiaSeleccionada}`);

    const manejarAsistencia = (data) => {
      if (String(data?.materiaId) !== String(materiaSeleccionada)) return;

      const usuario = data?.Usuario || data?.usuario || data?.alumno || null;
      if (!usuario) return;

      const alumnoNormalizado = {
        ...usuario,
        id: usuario.id ?? data?.usuarioId ?? data?.alumno?.id ?? null,
        nombre: usuario.nombre ?? usuario.name ?? "",
        cedula: usuario.cedula ?? usuario.cedula ?? ""
      };

      setAsistenciasEnVivo((prev) => {
        if (!alumnoNormalizado.id) return prev;
        const yaExiste = prev.some((a) => a && String(a.id) === String(alumnoNormalizado.id));
        if (yaExiste) return prev;
        return [alumnoNormalizado, ...prev];
      });
    };

    socket.on("nueva-asistencia", manejarAsistencia);

    return () => {
      socket.off("nueva-asistencia", manejarAsistencia);
    };
  }, [materiaSeleccionada]);

  // 3. Consultar datos analíticos de forma segura
  const verificarEstadoSesion = useCallback(async () => {
    if (!materiaSeleccionada || user?.rol === "admin") {
      setAlumnosMatriculados([]);
      setAsistenciasEnVivo([]);
      return;
    }
    
    try {
      const resAlumnos = await api.get(`/alumnos/materia/${materiaSeleccionada}`);
      const alumnos = Array.isArray(resAlumnos.data) ? resAlumnos.data : [];
      setAlumnosMatriculados(alumnos);

      const resHoy = await api.get("/asistencia/hoy?materiaId=" + materiaSeleccionada);
      const payload = resHoy.data || {};
      const asistenciasHoy = Array.isArray(payload.asistencias)
        ? payload.asistencias
        : Array.isArray(payload)
          ? payload
          : [];

      const alumnosFormateados = asistenciasHoy
        .map((asistencia) => {
          const usuario = asistencia?.Usuario || asistencia?.usuario || asistencia?.alumno || null;
          if (!usuario) return null;

          return {
            ...usuario,
            id: usuario.id ?? asistencia?.usuarioId ?? asistencia?.alumno?.id ?? null,
            nombre: usuario.nombre ?? usuario.name ?? "",
            cedula: usuario.cedula ?? usuario.cedula ?? "",
            materiaId: asistencia?.materiaId ?? materiaSeleccionada
          };
        })
        .filter(Boolean);

      setAsistenciasEnVivo(alumnosFormateados);
      setTotalMatriculados(
        typeof payload.totalMatriculados === "number"
          ? payload.totalMatriculados
          : alumnos.length
      );
    } catch (error) {
      console.error("Error sincronizando con los servicios de backend:", error);
      setAlumnosMatriculados([]);
      setAsistenciasEnVivo([]);
      setTotalMatriculados(0);
    }
  }, [materiaSeleccionada, user]);

  useEffect(() => {
    verificarEstadoSesion();
  }, [verificarEstadoSesion]);

  // 4. Encender el código QR dinámico vinculando a tu ruta de asistencia
  const iniciarSesionQr = async () => {
    if (!materiaSeleccionada) return;
    try {
      // Apunta a asistenciaController.generarQrMateria
      const res = await api.post("/asistencia/generar-qr", { materiaId: materiaSeleccionada });
      
      // Extraemos la propiedad 'token' tal como la genera tu backend
      const tokenGenerado = res.data?.token || res.data?.tokenQr || ""; 
      
      setQrToken(tokenGenerado);
      setSesionActiva(true);
      setModalQrAbierto(true);
    } catch (error) {
      console.error("Error al disparar tu generador de QR:", error);
    }
  };

  const terminarSesionQr = () => {
    setSesionActiva(false);
    setQrToken("");
    setModalQrAbierto(false);
  };

  // 5. Timer para regenerar el QR cada 30 segundos mientras la sesión está activa
  useEffect(() => {
    if (!sesionActiva || !materiaSeleccionada) return;

    const regenerarQr = async () => {
      try {
        const res = await api.post("/asistencia/generar-qr", { materiaId: materiaSeleccionada });
        const tokenGenerado = res.data?.token || res.data?.tokenQr || "";
        setQrToken(tokenGenerado);
      } catch (error) {
        console.error("Error regenerando QR:", error);
      }
    };

    // Regenerar cada 30 segundos
    const timer = setInterval(regenerarQr, 30000);

    return () => clearInterval(timer);
  }, [sesionActiva, materiaSeleccionada]);

  const cambiarMateria = (id) => {
    setMateriaSeleccionada(id);
    setAsistenciasEnVivo([]);
    setAlumnosMatriculados([]);
    setTotalMatriculados(0);
  };

  const asistenciasFiltradas = (asistenciasEnVivo || []).filter((alumno) => {
    if (!alumno || !alumno.nombre) return false;
    const busqueda = filtroAsistencia ? filtroAsistencia.toLowerCase() : "";
    return (
      alumno.nombre.toLowerCase().includes(busqueda) ||
      (alumno.cedula && alumno.cedula.includes(busqueda))
    );
  });

  return {
    user,
    logout,
    misMaterias,
    loadingMaterias,
    vistaActual,
    setVistaActual,
    materiaSeleccionada,
    cambiarMateria,
    sesionActiva,
    qrToken,
    alumnosMatriculados,
    totalMatriculados,
    asistenciasEnVivo,
    asistenciasFiltradas,
    modalQrAbierto,
    setModalQrAbierto,
    filtroAsistencia,
    setFiltroAsistencia,
    iniciarSesionQr,
    terminarSesionQr
  };
}
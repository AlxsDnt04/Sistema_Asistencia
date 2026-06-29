import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Power } from "lucide-react";

export default function QrModal({ abierto, token, onCerrar, onTerminar, qrSize = 240 }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayToken, setDisplayToken] = useState(token);

  // Efecto de transición suave cuando el token cambia
  useEffect(() => {
    if (token && token !== displayToken) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayToken(token);
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [token, displayToken]);

  if (!abierto || !token) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-slate-50/95 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-300 max-h-[98vh] overflow-y-auto">
        
        {/* Botón cerrar */}
        <button 
          onClick={onCerrar} 
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all duration-200 cursor-pointer hover:scale-110"
        >
          <X size={20} />
        </button>

        {/* Badge de estado con indicador animado */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Código Dinámico Activo
          </span>
        </div>

        {/* Encabezado */}
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-3 mb-2">
          Escanea para Asistencia
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-8 font-medium">
          Comparte esta pantalla con los estudiantes para que escaneen
        </p>

        {/* QR Container con efecto de transición tipo WhatsApp */}
        <div className="relative flex justify-center mb-8 h-80 flex items-center justify-center">
          <div 
            className={`bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-slate-100 transition-all duration-300 transform ${
              isTransitioning 
                ? "opacity-0 scale-75" 
                : "opacity-100 scale-100"
            }`}
          >
            <div className="relative">
              <QRCodeSVG 
                key={displayToken}
                value={displayToken} 
                size={qrSize} 
                level="H" 
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
                quietZone={10}
              />
              {/* Efecto de reflejo sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Info de tamaño y tiempo */}
        <p className="text-xs text-slate-400 mb-6 font-medium">
          Tamaño QR: {qrSize}px • Se regenera cada 30s
        </p>

        {/* Botón detener */}
        <button 
          onClick={onTerminar} 
          className="w-full bg-violet-600 text-white font-bold py-3 sm:py-3.5 rounded-2xl text-sm transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer hover:bg-violet-700 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <Power size={18} /> 
          <span>Detener Transmisión</span>
        </button>

        {/* Nota informativa */}
        <div className="mt-6 p-3 sm:p-4 bg-violet-50 border border-violet-200 rounded-2xl">
          <p className="text-xs sm:text-sm text-violet-700 font-medium">
            💡 El código se regenera automáticamente cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
}
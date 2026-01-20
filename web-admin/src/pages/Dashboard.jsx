import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; 
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, QrCode, Clock, CheckCircle, User } from 'lucide-react';

// backend
const socket = io('http://localhost:3000'); 

export default function Dashboard() {
  const [qrValue, setQrValue] = useState('');
  const [alumnos, setAlumnos] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Escuchar el QR (llega texto/token)
    socket.on('qr-code', (token) => {
      console.log("QR Recibido:", token);
      setQrValue(token);
    });

    // 2. Escuchar asistencia
    socket.on('asistencia-registrada', (data) => {
      setAlumnos((prev) => [data, ...prev]); 
    });

    return () => {
      socket.off('qr-code');
      socket.off('asistencia-registrada');
    };
  }, []);

  const finalizarClase = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-10 font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 bg-gray-800/60 p-4 rounded-2xl border border-gray-700 backdrop-blur-md">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Panel de Control
            </h1>
            <p className="text-gray-400 flex items-center gap-2 mt-1">
                <User size={16} /> Prof. Ing. Carlos Docente
            </p>
        </div>
        <button 
            onClick={finalizarClase}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-semibold"
        >
            <LogOut size={18} /> Salir
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TARJETA QR (Izquierda) */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-center">
                    <QrCode className="text-blue-400" /> Escáner de Asistencia
                </h2>
                <p className="text-gray-400 text-sm mt-2">El código se actualiza automáticamente</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-inner border-4 border-white">
                {qrValue ? (
                    <QRCodeCanvas 
                        value={qrValue} 
                        size={256} 
                        level={"H"} 
                        includeMargin={true}
                    />
                ) : (
                    <div className="w-64 h-64 flex flex-col items-center justify-center text-gray-500 bg-gray-100 rounded-lg animate-pulse">
                        <QrCode size={48} className="mb-2 opacity-20" />
                        <span className="text-sm font-medium">Conectando...</span>
                    </div>
                )}
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                Sincronización en tiempo real activa
            </div>
        </div>

        {/* LISTA DE ASISTENCIA (Derecha) */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-2xl">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="text-green-400" /> Asistencia
                </h2>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-600">
                    {alumnos.length} Presentes
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {alumnos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <Users size={64} strokeWidth={1} className="mb-4" />
                        <p>Esperando estudiantes...</p>
                    </div>
                ) : (
                    alumnos.map((alumno, index) => (
                        <div 
                            key={index} 
                            className="flex justify-between items-center bg-gray-700/50 hover:bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all transform hover:scale-[1.02]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                    {alumno.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg leading-tight">{alumno.nombre}</p>
                                    <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                                        <CheckCircle size={10} /> Registrado correctamente
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-gray-300 bg-gray-800 px-2 py-1 rounded-md border border-gray-600">
                                    <Clock size={12} />
                                    <span className="font-mono text-sm">{alumno.hora}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
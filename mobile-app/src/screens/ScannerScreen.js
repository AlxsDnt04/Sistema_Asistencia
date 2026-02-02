// mobile-app/src/screens/ScannerScreen.js
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Iconos bonitos
import api from '../services/api';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    (async () => {
      const userStored = await AsyncStorage.getItem('usuario');
      if (userStored) setUsuario(JSON.parse(userStored));
    })();
  }, []);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.textPermiso}>Se requiere acceso a la cámara</Text>
        <TouchableOpacity style={styles.btnPermiso} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir Acceso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    // Vibración opcional aquí
    registrarAsistencia(data);
  };

  const registrarAsistencia = async (qrToken) => {
    try {
      await api.post('/asistencia/registrar', { qrToken });
      
      Alert.alert(
        "✅ ¡Excelente!",
        "Tu asistencia ha sido registrada exitosamente.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    } catch (error) {
      console.log(error.response);
      let mensaje = "No se pudo conectar con el servidor";
      let titulo = "❌ Error";

      if (error.response) {
        // Capturamos el error 409 (Duplicado) o 400
        mensaje = error.response.data.message;
        if (error.response.status === 409) {
            titulo = "⚠️ Atención";
        }
      }

      Alert.alert(titulo, mensaje, [
        { text: "Entendido", onPress: () => setScanned(false) }
      ]);
    }
  };

  const cerrarSesion = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.username}>{usuario?.nombre || 'Estudiante'}</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={styles.btnLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* CÁMARA */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        {/* Marco visual */}
        <View style={styles.scanFrame}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.instructionTitle}>Escanea el QR</Text>
        <Text style={styles.instructionText}>
          Apunta la cámara al código proyectado por el profesor para registrar tu asistencia.
        </Text>
      </View>
    </View>
  );
}

// ESTILOS MEJORADOS "DARK MODE"
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' }, // Slate 900
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 25, 
    marginBottom: 20 
  },
  greeting: { color: '#94A3B8', fontSize: 16 },
  username: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  btnLogout: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  
  cameraContainer: { 
    flex: 1, 
    marginHorizontal: 20, 
    borderRadius: 30, 
    overflow: 'hidden', 
    elevation: 10,
    borderColor: '#3B82F6',
    borderWidth: 1
  },
  scanFrame: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Esquinas del marco decorativo
  cornerTL: { position: 'absolute', top: 40, left: 40, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#00FF9D' },
  cornerTR: { position: 'absolute', top: 40, right: 40, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#00FF9D' },
  cornerBL: { position: 'absolute', bottom: 40, left: 40, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#00FF9D' },
  cornerBR: { position: 'absolute', bottom: 40, right: 40, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#00FF9D' },

  footer: { padding: 30, alignItems: 'center' },
  instructionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  instructionText: { color: '#64748B', textAlign: 'center', fontSize: 14 },
  
  textPermiso: { color: 'white', fontSize: 16, marginBottom: 20 },
  btnPermiso: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: 'bold' }
});
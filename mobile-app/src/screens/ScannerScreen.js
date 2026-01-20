// mobile-app/src/screens/ScannerScreen.js
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // <--- NUEVO COMPONENTE
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ScannerScreen({ navigation }) {
  // Hook moderno para permisos
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Cargar datos del usuario guardado
    (async () => {
      const userStored = await AsyncStorage.getItem('usuario');
      if (userStored) setUsuario(JSON.parse(userStored));
    })();
  }, []);

  // Manejo de permisos (Cargando / Denegado)
  if (!permission) {
    return <View style={styles.container}><Text>Cargando permisos...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesitamos acceso a la cámara</Text>
        <Button onPress={requestPermission} title="Dar Permiso" />
      </View>
    );
  }

  // Lógica cuando lee el QR
  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    Alert.alert(
      "¡QR Detectado!",
      `Token: ${data.substring(0, 15)}...`,
      [
        { text: "Cancelar", onPress: () => setScanned(false), style: "cancel" },
        { text: "Registrar", onPress: () => registrarAsistencia(data) }
      ]
    );
  };

  const registrarAsistencia = async (qrData) => { 
    try {
      console.log("Enviando token:", qrData); 

      // La URL debe apuntar a la ruta de asistencia, no de auth
      // La clave del objeto debe ser 'qrToken' (igual que en el backend)
      
      await api.post('/asistencia/registrar', { 
        qrToken: qrData 
      });

      Alert.alert("✅ Éxito", "Tu asistencia ha sido registrada en la base de datos.");
      
      // Volver al inicio
      navigation.replace('Scanner'); // O navigation.navigate('Home') si tienes uno

    } catch (error) {
      console.error(error);
      const mensaje = error.response?.data?.message || "No se pudo conectar con el servidor";
      Alert.alert("❌ Error", mensaje);
    } finally {
      setScanned(false);
    }
  };

  const cerrarSesion = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Nueva Cámara Moderna */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Interfaz superpuesta (Overlay) */}
      <View style={styles.overlay}>
        <View style={styles.header}>
            <Text style={styles.welcome}>Hola, {usuario?.nombre || 'Estudiante'}</Text>
        </View>

        <View style={styles.scanFrame} />
        
        <View style={styles.footer}>
            <Text style={styles.instruction}>Apunta al código QR del profesor</Text>
            <TouchableOpacity onPress={cerrarSesion} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  text: { color: 'white', textAlign: 'center', marginBottom: 20 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  header: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 },
  welcome: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#00FF00', backgroundColor: 'transparent', borderRadius: 20 },
  footer: { alignItems: 'center', width: '100%' },
  instruction: { color: 'white', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 5, borderRadius: 5 },
  logoutButton: { backgroundColor: 'red', padding: 10, borderRadius: 8, width: 150, alignItems: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold' }
});
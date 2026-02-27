import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Location from 'expo-location';
import EmergencyButton from './components/EmergencyButton';

export default function App() {
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioPermission, requestMicrophonePermission] = useMicrophonePermissions();

  useEffect(() => {
    (async () => {
      // Request Camera and Microphone native permissions
      const cameraStatus = await requestCameraPermission();
      const audioStatus = await requestMicrophonePermission();
      // Request GPS location permissions
      const locationStatus = await Location.requestForegroundPermissionsAsync();

      setHasPermissions(
        cameraStatus.status === 'granted' &&
        audioStatus.status === 'granted' &&
        locationStatus.status === 'granted'
      );
    })();
  }, []);

  if (hasPermissions === null) {
    return <View style={styles.container}><Text style={styles.text}>Requesting permissions...</Text></View>;
  }

  if (hasPermissions === false) {
    return <View style={styles.container}><Text style={styles.text}>Camera, Audio, and Location permissions are required.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dashboard View */}
      <View style={styles.dashboard}>
        <Text style={styles.title}>FiveSense Alert</Text>
        <Text style={styles.subtitle}>Protecting you actively.</Text>

        {/* Render our Core Button */}
        <EmergencyButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme consistent with web
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 50,
  },
  text: {
    color: '#ffffff',
  }
});

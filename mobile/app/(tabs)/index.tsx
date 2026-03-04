import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import CameraManager from '../../components/CameraManager';

import EmergencyButton from '../../components/EmergencyButton';
import SectionHeader from '../../components/SectionHeader';
import StatusCard from '../../components/StatusCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Home() {
  const triggerRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isEmergencyRecording, setIsEmergencyRecording] = useState(false);
  const [config, setConfig] = useState({
    gestureDetection: true,
    voiceDetection: true,
  });

  const loadConfig = async () => {
    const savedConfig = await AsyncStorage.getItem('fivesense_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          gestureDetection: parsed.gestureDetection ?? true,
          voiceDetection: parsed.voiceDetection ?? true,
        });
      } catch (e) {
        console.error('Parse config error', e);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadConfig();
      if (!cameraPermission?.granted) requestCameraPermission();
      if (!micPermission?.granted) requestMicPermission();
    }, [cameraPermission, micPermission])
  );

  const handleAutoTrigger = () => {
    if (triggerRef.current && config.gestureDetection) {
      triggerRef.current.triggerEmergency();
    }
  };

  return (
    <View style={styles.container}>
      {/* 
        We use CameraManager (ML webview) for gesture detection visually,
        but we STILL need hardware CameraView to exist to record video when triggered!
      */}
      {config.gestureDetection && (cameraPermission?.granted && micPermission?.granted) && !isEmergencyRecording ? (
        <CameraManager onTrigger={handleAutoTrigger} />
      ) : (
        (cameraPermission?.granted && micPermission?.granted) && (
          <View style={isEmergencyRecording ? styles.cameraWrapper : styles.hiddenCamera}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front" mode="video" />
            {isEmergencyRecording && (
              <View style={[styles.badge, { backgroundColor: 'rgba(225,6,0,0.8)' }]}>
                <View style={[styles.dot, { backgroundColor: '#ffffff' }]} />
                <Text style={styles.badgeText}>Recording Emergency...</Text>
              </View>
            )}
          </View>
        )
      )}
      <View style={styles.buttonContainer}>
        <EmergencyButton
          ref={triggerRef}
          passedCameraRef={cameraRef}
          onRecordingStateChange={setIsEmergencyRecording}
        />
      </View>

      <View style={styles.statusSection}>
        <SectionHeader
          title="System Status"
          description="Real-time monitoring of your sensors"
          style={styles.sectionHeader}
        />

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatusCard label="Camera" status={config.gestureDetection ? 'active' : 'inactive'} icon={<Ionicons name="camera" size={16} color="#6b7280" />} />
          </View>
          <View style={styles.gridItem}>
            <StatusCard label="Microphone" status={config.voiceDetection ? 'active' : 'inactive'} icon={<Ionicons name="mic" size={16} color="#6b7280" />} />
          </View>
          <View style={styles.gridItem}>
            <StatusCard label="Location" status="active" icon={<Ionicons name="location" size={16} color="#6b7280" />} />
          </View>
          <View style={styles.gridItem}>
            <StatusCard label="Battery" status="warning" value="Monitor" icon={<Ionicons name="battery-charging" size={16} color="#6b7280" />} />
          </View>
        </View>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 50, // Safe area space
    paddingBottom: 70, // Tab bar space
    justifyContent: 'space-between',
  },
  hiddenCamera: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
    zIndex: -1
  },
  cameraWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.22, // roughly 22% of screen
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  statusSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sectionHeader: {
    marginVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    width: '50%',
    padding: 4,
  },
});

import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmergencyButton() {
    const [status, setStatus] = useState<'idle' | 'recording' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const cameraRef = useRef<CameraView>(null);

    const triggerEmergency = async () => {
        if (status === 'recording' || status === 'sending') return;
        setStatus('recording');

        try {
            // 1. Record 5 second video snippet (Mobile Native)
            let videoUri = "";
            if (cameraRef.current) {
                const videoRecordPromise = cameraRef.current.recordAsync({ maxDuration: 5 });
                const videoData = await videoRecordPromise;
                if (videoData && videoData.uri) {
                    videoUri = videoData.uri;
                }
            }

            setStatus('sending');

            // 2. Fetch Native GPS Location
            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const latitude = location ? location.coords.latitude.toString() : "0.0";
            const longitude = location ? location.coords.longitude.toString() : "0.0";

            // 3. Fetch Native Battery Data
            let batteryLevel = "100";
            let batteryStatus = "Unknown";
            try {
                const level = await Battery.getBatteryLevelAsync();
                const state = await Battery.getBatteryStateAsync();
                batteryLevel = Math.round(level * 100).toString();
                batteryStatus = state === Battery.BatteryState.CHARGING ? "Charging" : "Not Charging";
            } catch (e) { console.error(e) }

            // 4. Construct FormData perfectly matching Next.js API constraints
            const formData = new FormData();
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("battery_level", batteryLevel);
            formData.append("battery_status", batteryStatus);

            // Append mobile video file natively
            if (videoUri) {
                // @ts-ignore - React Native polyfills FormData file differently than web
                formData.append('video', {
                    uri: videoUri,
                    name: 'record.mp4',
                    type: 'video/mp4',
                });
            }

            // 5. Append WhatsApp config from Native AsyncStorage
            const savedConfig = await AsyncStorage.getItem("fivesense_whatsapp_config");
            if (savedConfig) {
                const waConfig = JSON.parse(savedConfig);
                if (waConfig.accessToken) formData.append("whatsapp_access_token", waConfig.accessToken);
                if (waConfig.phoneNumberId) formData.append("whatsapp_phone_number_id", waConfig.phoneNumberId);
                if (waConfig.recipients) formData.append("whatsapp_recipients", waConfig.recipients);
            }

            // 6. Send Multipart API Payload!
            // NOTE: Replace with your actual server IP testing on LAN! 
            // (e.g. http://192.168.1.5:3000/api/send-alert)
            const res = await fetch('http://localhost:3000/api/send-alert', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!res.ok) {
                throw new Error("Failed to send alert via server.");
            }

            setStatus('success');
            setTimeout(() => setStatus('idle'), 4000);

        } catch (e: any) {
            console.error(e);
            setErrorMessage(e.message || 'Connection failed');
            setStatus('error');
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage('');
            }, 5000);
        }
    };

    return (
        <View style={styles.container}>
            {/* Hidden camera instance purely to capture the video invisibly */}
            <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
                <CameraView ref={cameraRef} style={{ width: 10, height: 10 }} facing="front" mode="video" mute={true} />
            </View>

            <TouchableOpacity
                onPress={triggerEmergency}
                disabled={status === 'recording' || status === 'sending'}
                style={[
                    styles.button,
                    status === 'success' ? styles.success : status === 'error' ? styles.error : styles.idle
                ]}
            >
                <Text style={styles.mainText}>
                    {status === 'recording' ? 'RECORDING' : status === 'sending' ? 'SENDING' : status === 'success' ? 'SENT' : status === 'error' ? 'FAILED' : 'EMERGENCY'}
                </Text>
                <Text style={styles.subText}>
                    {status === 'recording' ? 'CAPTURING 5S INFO...' : status === 'idle' ? 'TAP TO TRIGGER' : ''}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 40,
    },
    button: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 6,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 20, // Adds shadow on Android natively
    },
    idle: {
        backgroundColor: '#E10600', // Deep red
    },
    success: {
        backgroundColor: '#10B981', // Green
    },
    error: {
        backgroundColor: '#F97316', // Orange
    },
    mainText: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 2,
    },
    subText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
        opacity: 0.9,
    }
});

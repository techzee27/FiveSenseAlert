import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';

const EmergencyButton = forwardRef((props: any, ref) => {
    const { passedCameraRef } = props;
    const [status, setStatus] = useState<'idle' | 'recording' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const triggerEmergency = async () => {
        if (status === 'sending' || status === 'recording') return;
        setStatus('recording');

        let videoUri: string | null = null;
        if (props.onRecordingStateChange) props.onRecordingStateChange(true);

        // Preheat location & battery while video is buffering
        const locPromise = (async () => {
            let loc: Location.LocationObject | null = null;
            let p = await Location.requestForegroundPermissionsAsync();
            if (p.status === 'granted') {
                loc = await Location.getLastKnownPositionAsync({});
                if (!loc) {
                    loc = await Promise.race([
                        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
                        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
                    ]);
                }
            }
            return loc;
        })();

        const batPromise = (async () => {
            const level = Math.round((await Battery.getBatteryLevelAsync()) * 100).toString();
            const state = await Battery.getBatteryStateAsync();
            const status = state === Battery.BatteryState.CHARGING ? 'Charging' : 'Not Charging';
            return { level, status };
        })();

        // Wait for parent to unmount ML CameraManager and mount hardware CameraView
        let attempts = 0;
        while (!passedCameraRef?.current && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 150));
            attempts++;
        }

        // Wait an additional 1000ms to allow native hardware camera to initialize and lock securely
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            if (passedCameraRef?.current) {
                const videoRecord = await passedCameraRef.current.recordAsync({ maxDuration: 3 });
                if (videoRecord) videoUri = videoRecord.uri;
            } else {
                console.warn('Camera ref still null. Falling back to 3s delay without video.');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } catch (e) {
            console.error('Camera recording failed', e);
            // Wait 3s anyway to make sure we don't rush the UI if recording failed
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (props.onRecordingStateChange) props.onRecordingStateChange(false);
        setStatus('sending');

        try {
            const [location, battery] = await Promise.all([locPromise, batPromise]);

            const latitude = location ? location.coords.latitude.toString() : '0.0';
            const longitude = location ? location.coords.longitude.toString() : '0.0';

            const formData = new FormData();
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            formData.append('battery_level', battery.level);
            formData.append('battery_status', battery.status);

            if (videoUri) {
                // @ts-ignore
                formData.append('video', {
                    uri: videoUri,
                    name: 'record.mp4',
                    type: 'video/mp4',
                });
            }

            const savedConfig = await AsyncStorage.getItem('fivesense_whatsapp_config');
            if (savedConfig) {
                try {
                    const waConfig = JSON.parse(savedConfig);
                    if (waConfig.accessToken) formData.append('whatsapp_access_token', waConfig.accessToken);
                    if (waConfig.phoneNumberId) formData.append('whatsapp_phone_number_id', waConfig.phoneNumberId);
                    if (waConfig.recipients) formData.append('whatsapp_recipients', waConfig.recipients);
                } catch (e) {
                    console.error('WhatsApp config err', e);
                }
            }

            const res = await fetch(`${API_URL}/api/send-alert`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    // DO NOT SET Content-Type: multipart/form-data! Fetch must strictly set this itself to attach the boundary!
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErrorMessage(data.error || 'Failed to send alert');
                setStatus('error');
                setTimeout(() => {
                    setStatus('idle');
                    setErrorMessage('');
                }, 6000);
                return;
            }

            setStatus('success');
            setErrorMessage('');
            setTimeout(() => setStatus('idle'), 4000);
        } catch (error: any) {
            console.error('Fetch err', error);
            setErrorMessage(`${error.message || 'Connection failed'} (${API_URL})`);
            setStatus('error');
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage('');
            }, 6000);
        }
    };

    useImperativeHandle(ref, () => ({
        triggerEmergency,
    }));

    const getButtonStyles = () => {
        switch (status) {
            case 'success': return { bg: '#10B981', border: '#10B981' };
            case 'error': return { bg: '#F97316', border: '#F97316' };
            default: return { bg: '#E10600', border: '#ffffff' };
        }
    };

    const getSubtext = () => {
        switch (status) {
            case 'recording': return 'CAPTURING 3S VIDEO';
            case 'sending': return 'PLEASE WAIT';
            case 'success': return 'ALREADY SENT';
            case 'error': return 'TRY AGAIN';
            default: return 'TAP TO TRIGGER';
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'idle': return 'MANUAL TRIGGER READY';
            case 'recording': return 'RECORDING 3S VIDEO...';
            case 'sending': return 'SYNCING PAYLOAD...';
            case 'success': return 'ALERT DELIVERED';
            case 'error': return errorMessage ? errorMessage.toUpperCase() : 'CONNECTION FAILED';
        }
    };

    const colors = getButtonStyles();

    return (
        <View style={styles.container}>
            <View style={[styles.halo, (status === 'sending' || status === 'recording') && styles.haloPulse]} />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={triggerEmergency}
                disabled={status === 'sending' || status === 'recording'}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    {status === 'recording' ? 'RECORDING' : status === 'sending' ? 'SENDING' : status === 'success' ? 'SENT' : status === 'error' ? 'FAILED' : 'EMERGENCY'}
                </Text>
                <Text style={styles.subText}>{getSubtext()}</Text>
            </TouchableOpacity>

            <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, status === 'success' && { color: '#15803d' }, status === 'error' && { color: '#b91c1c' }]}>
                    {getStatusMessage()}
                </Text>
            </View>
        </View>
    );
});

EmergencyButton.displayName = 'EmergencyButton';
export default EmergencyButton;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    halo: {
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: 'rgba(225, 6, 0, 0.2)',
        position: 'absolute',
        top: 2, // Centering fix
    },
    haloPulse: {
        backgroundColor: 'rgba(225, 6, 0, 0.4)',
    },
    button: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E10600',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
        zIndex: 2, // ensure button is above halo
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 2,
    },
    subText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 9,
        fontWeight: '700',
    },
    statusBadge: {
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        zIndex: 3,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});

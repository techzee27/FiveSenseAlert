import Constants from 'expo-constants';
import { Platform } from 'react-native';

let ip = '192.168.0.101'; // Default fallback to active Metro network host
const debuggerHost = Constants.expoConfig?.hostUri;

if (debuggerHost) {
    ip = debuggerHost.split(':')[0];
} else if (Constants.experienceUrl) {
    try {
        // "exp://192.168.0.101:8081"
        const parsed = new URL(Constants.experienceUrl);
        if (parsed.hostname) ip = parsed.hostname;
    } catch (e) { }
} else if (Platform.OS === 'android') {
    ip = '10.0.2.2';
}

export const API_URL = 'https://five-sense-alert.vercel.app';

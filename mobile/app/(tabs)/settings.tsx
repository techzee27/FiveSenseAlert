import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import PrimaryButton from '../../components/PrimaryButton';
import { API_URL } from '../../utils/api';

export default function Settings() {
  const router = useRouter();
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState({
    voiceDetection: true,
    gestureDetection: true,
    batterySharing: true,
    locationSharing: true,
  });

  const loadConfig = async () => {
    const savedConfig = await AsyncStorage.getItem('fivesense_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse config');
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadConfig();
    }, [])
  );

  const updateConfig = async (key: keyof typeof config, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    await AsyncStorage.setItem('fivesense_config', JSON.stringify(newConfig));
  };

  const handleTestAlert = async () => {
    setIsTesting(true);
    try {
      const formData = new FormData();
      formData.append('latitude', '40.7128');
      formData.append('longitude', '-74.0060');
      formData.append('battery_level', '100');
      formData.append('battery_status', 'Charging [TEST]');

      const savedWaConfig = await AsyncStorage.getItem('fivesense_whatsapp_config');
      if (savedWaConfig) {
        const waConfig = JSON.parse(savedWaConfig);
        if (waConfig.accessToken) formData.append('whatsapp_access_token', waConfig.accessToken);
        if (waConfig.phoneNumberId) formData.append('whatsapp_phone_number_id', waConfig.phoneNumberId);
        if (waConfig.recipients) formData.append('whatsapp_recipients', waConfig.recipients);
      }

      const res = await fetch(`${API_URL}/api/send-alert`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.ok) throw new Error('Test failed');
      alert('Test alert sent successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to send test alert check if backend is running.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Settings" description="Configure your system preferences" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRIGGER SETTINGS</Text>
        <ToggleSwitch
          label="Enable Voice Detection"
          initialState={config.voiceDetection}
          onChange={(val) => updateConfig('voiceDetection', val)}
        />
        <ToggleSwitch
          label="Enable Gesture Detection"
          initialState={config.gestureDetection}
          onChange={(val) => updateConfig('gestureDetection', val)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DEVICE MONITORING</Text>
        <ToggleSwitch
          label="Enable Battery Status Sharing"
          initialState={config.batterySharing}
          onChange={(val) => updateConfig('batterySharing', val)}
        />
        <ToggleSwitch
          label="Enable Location Sharing"
          initialState={config.locationSharing}
          onChange={(val) => updateConfig('locationSharing', val)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTEGRATIONS</Text>
        <TouchableOpacity
          style={styles.integrationCard}
          activeOpacity={0.8}
          onPress={() => router.push('/whatsapp-config')}
        >
          <View style={styles.integrationLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles" size={24} color="#10B981" />
            </View>
            <View>
              <Text style={styles.integrationTitle}>React WhatsApp Config</Text>
              <Text style={styles.integrationSubtitle}>Setup API keys and recipients</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.footerSection}>
        <PrimaryButton variant="secondary" onClick={handleTestAlert} isLoading={isTesting}>
          Send Test Alert
        </PrimaryButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingTop: 60, paddingBottom: 100 },
  section: { marginVertical: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9ca3af',
    marginBottom: 8,
    paddingHorizontal: 4,
    letterSpacing: 1,
  },
  integrationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  integrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  integrationSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 4,
  },
  footerSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});

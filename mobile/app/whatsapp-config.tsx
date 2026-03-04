import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import SectionHeader from '../components/SectionHeader';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

export default function WhatsAppConfig() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [config, setConfig] = useState({
        accessToken: '',
        phoneNumberId: '',
        recipients: '',
    });

    useEffect(() => {
        (async () => {
            const savedConfig = await AsyncStorage.getItem('fivesense_whatsapp_config');
            if (savedConfig) setConfig(JSON.parse(savedConfig));
        })();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        await AsyncStorage.setItem('fivesense_whatsapp_config', JSON.stringify(config));

        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#4b5563" />
                    </TouchableOpacity>
                    <SectionHeader title="WhatsApp Setup" style={styles.headerTitle} />
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Configure your WhatsApp Business API credentials to enable instant emergency alerts via messages.
                    </Text>
                </View>

                <InputField
                    label="WhatsApp Access Token"
                    value={config.accessToken}
                    onChangeText={(v) => setConfig({ ...config, accessToken: v })}
                    placeholder="Enter secure token"
                    secureTextEntry
                />
                <InputField
                    label="Phone Number ID"
                    value={config.phoneNumberId}
                    onChangeText={(v) => setConfig({ ...config, phoneNumberId: v })}
                    placeholder="e.g. 1029384756"
                />
                <InputField
                    label="Recipient Numbers"
                    value={config.recipients}
                    onChangeText={(v) => setConfig({ ...config, recipients: v })}
                    placeholder="Comma separated (+123456789)"
                />

                <View style={styles.buttonGroup}>
                    <PrimaryButton onClick={handleSave} isLoading={isLoading}>
                        Save Configuration
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" onClick={() => alert('Test ping sent!')}>
                        Test API Connection
                    </PrimaryButton>
                </View>

                {showSuccess && (
                    <View style={styles.successToast}>
                        <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                        <Text style={styles.successText}>Configuration Saved!</Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: { marginVertical: 0 },
    infoBox: {
        backgroundColor: '#eff6ff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        marginBottom: 32,
    },
    infoText: {
        color: '#1e40af',
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    buttonGroup: {
        marginTop: 32,
        gap: 16,
    },
    successToast: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
        gap: 8,
    },
    successText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
});

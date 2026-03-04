import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusCard({
    label,
    status,
    value,
    icon,
}: {
    label: string;
    status: 'active' | 'inactive' | 'warning';
    value?: string;
    icon: React.ReactNode;
}) {
    const getStatusColors = () => {
        switch (status) {
            case 'active':
                return { bg: '#dcfce7', text: '#15803d' };
            case 'inactive':
                return { bg: '#f3f4f6', text: '#6b7280' };
            case 'warning':
                return { bg: '#ffedd5', text: '#c2410c' };
        }
    };

    const colors = getStatusColors();
    const statusText = status === 'warning' ? value : status === 'active' ? 'Active' : 'Inactive';

    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <View style={styles.iconContainer}>{icon}</View>
                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>{statusText}</Text>
                </View>
            </View>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 100,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    iconContainer: {
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
});

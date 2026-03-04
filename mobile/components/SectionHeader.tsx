import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SectionHeader({ title, description, style }: { title: string; description?: string; style?: any }) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
});

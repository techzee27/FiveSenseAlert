import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function PrimaryButton({
    children,
    onClick,
    variant = 'primary',
    isLoading = false,
    style,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    style?: any;
}) {
    const getStyles = () => {
        switch (variant) {
            case 'primary': return { bg: '#2563EB', text: '#ffffff' };
            case 'secondary': return { bg: '#f3f4f6', text: '#1f2937' };
            case 'danger': return { bg: '#ef4444', text: '#ffffff' };
        }
    };

    const colors = getStyles();

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.bg }, style]}
            onPress={onClick}
            disabled={isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={colors.text} />
            ) : (
                <Text style={[styles.text, { color: colors.text }]}>{children}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
});

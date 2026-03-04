import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function ToggleSwitch({
    label,
    initialState,
    onChange,
}: {
    label: string;
    initialState: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Switch
                value={initialState}
                onValueChange={onChange}
                trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                thumbColor={'#ffffff'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginVertical: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
});

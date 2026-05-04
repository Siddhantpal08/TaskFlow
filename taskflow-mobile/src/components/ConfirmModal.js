import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DARK as t } from '../data/themes';

export default function ConfirmModal({ visible, title, body, confirmLabel = 'Confirm', danger = true, onConfirm, onClose }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    <Text style={s.title}>{title}</Text>
                    <Text style={s.body}>{body}</Text>

                    <View style={s.btnRow}>
                        <TouchableOpacity style={[s.btn, s.btnCancel]} onPress={onClose} disabled={loading}>
                            <Text style={s.btnCancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[s.btn, danger ? s.btnDanger : s.btnPrimary, loading && { opacity: 0.6 }]} 
                            onPress={handleConfirm} 
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={danger ? t.red : '#000'} size="small" />
                            ) : (
                                <Text style={[s.btnConfirmTxt, danger && { color: t.red }]}>{confirmLabel}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modal: {
        backgroundColor: t.card,
        width: '100%',
        maxWidth: 360,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: t.border
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: t.t1,
        marginBottom: 10
    },
    body: {
        fontSize: 14,
        color: t.t3,
        marginBottom: 24,
        lineHeight: 20
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12
    },
    btn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnCancel: {
        backgroundColor: t.surf,
        borderWidth: 1,
        borderColor: t.border
    },
    btnCancelTxt: {
        color: t.t2,
        fontWeight: 'bold',
        fontSize: 14
    },
    btnDanger: {
        backgroundColor: t.red + '20',
        borderWidth: 1,
        borderColor: t.red + '50'
    },
    btnPrimary: {
        backgroundColor: t.accent + '20',
        borderWidth: 1,
        borderColor: t.accent + '50'
    },
    btnConfirmTxt: {
        color: t.accent,
        fontWeight: '800',
        fontSize: 14
    }
});

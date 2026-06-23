import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS } from '../constants/brand';

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function LogoutConfirmModal({
  visible,
  onCancel,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={s.title}>Sign Out?</Text>
          <Text style={s.message}>
            Are you sure you want to sign out of your account?
          </Text>

          <View style={s.buttonGroup}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={s.cancelBtnText}>KEEP BROWSING</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtn, isLoading && s.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={s.confirmBtnText}>
                {isLoading ? 'SIGNING OUT...' : 'SIGN OUT'}
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '85%',
    maxWidth: 400,
    gap: 16,
    padding: 24,
  },
  title: {
    fontFamily: FONTS.clashMedium,
    fontSize: 18,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

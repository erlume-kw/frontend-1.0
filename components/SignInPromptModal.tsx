import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS } from '../constants/brand';

interface SignInPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export default function SignInPromptModal({ visible, onClose, onSignIn }: SignInPromptModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={s.title}>Sign In Required</Text>
          <Text style={s.message}>
            You need to be signed in to add items to your wishlist.
          </Text>

          <View style={s.buttonGroup}>
            <TouchableOpacity style={s.secondaryBtn} onPress={onClose}>
              <Text style={s.secondaryBtnText}>MAYBE LATER</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primaryBtn} onPress={onSignIn}>
              <Text style={s.primaryBtnText}>SIGN IN</Text>
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
  primaryBtn: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/authService';
import { ThriveInput } from '../common/ThriveInput';
import { ThriveButton } from '../common/ThriveButton';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg(t('auth.emptyFields'));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(t('auth.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await authService.changePassword(newPassword.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(t('auth.passwordChangedSuccess'));
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || t('common.error'));
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Lock size={18} color={Colors.primary} />
              </View>
              <Text style={styles.title}>{t('auth.changePasswordTitle')}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {!!successMsg && (
              <View style={styles.successBox}>
                <CheckCircle2 size={18} color={Colors.success} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            <ThriveInput
              label={t('auth.newPassword')}
              placeholder={t('auth.newPasswordPlaceholder')}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={(txt: string) => {
                setNewPassword(txt);
                if (errorMsg) setErrorMsg('');
              }}
              leftIcon={<Lock size={18} color={Colors.textMuted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={{ padding: 4 }}>
                  {showNew ? (
                    <EyeOff size={18} color={Colors.textMuted} />
                  ) : (
                    <Eye size={18} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <ThriveInput
              label={t('auth.confirmNewPassword')}
              placeholder={t('auth.confirmNewPasswordPlaceholder')}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={(txt: string) => {
                setConfirmPassword(txt);
                if (errorMsg) setErrorMsg('');
              }}
              leftIcon={<Lock size={18} color={Colors.textMuted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ padding: 4 }}>
                  {showConfirm ? (
                    <EyeOff size={18} color={Colors.textMuted} />
                  ) : (
                    <Eye size={18} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />
          </ScrollView>

          <View style={styles.footer}>
            <ThriveButton
              title={t('common.cancel')}
              variant="secondary"
              onPress={handleClose}
              style={{ flex: 1 }}
            />
            <ThriveButton
              title={t('auth.saveNewPassword')}
              variant="primary"
              loading={loading}
              onPress={handleSave}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
});

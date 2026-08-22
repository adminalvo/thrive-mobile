import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../types/auth.types';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'az', label: 'Azərbaycan dili', flag: '🇦🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const { language, setLanguage } = useLanguage();

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Dil seçimi / Language</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.list}>
                {LANGUAGES.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item.code)}
                      style={[styles.langItem, isSelected && styles.langItemSelected]}
                    >
                      <View style={styles.langLeft}>
                        <Text style={styles.flag}>{item.flag}</Text>
                        <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                          {item.label}
                        </Text>
                      </View>
                      {isSelected && <Check size={18} color={Colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    gap: Spacing.sm,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#0F2744',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flag: {
    fontSize: 20,
  },
  langText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  langTextSelected: {
    fontWeight: '700',
    color: Colors.primary,
  },
});

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, FileText, Shield, CheckCircle } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveButton } from '../common/ThriveButton';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose }) => {
  const { t, language } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Shield size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>
                  {language === 'az'
                    ? 'İstifadəçi Qaydaları və Məxfilik'
                    : language === 'ru'
                    ? 'Условия использования и конфиденциальность'
                    : 'Terms of Service & Privacy'}
                </Text>
                <Text style={styles.subtitle}>Thrive Education Policy v1.0</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Section 1 */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {language === 'az'
                  ? '1. Ümumi Tədris Nizam-İntizamı'
                  : language === 'ru'
                  ? '1. Общий учебный регламент'
                  : '1. General Educational Conduct'}
              </Text>
              <Text style={styles.sectionBody}>
                {language === 'az'
                  ? 'Thrive Təhsil Mərkəzinin mobil platformasından istifadə edən bütün tələbələr, müəllimlər və valideynlər mərkəzin daxili tədris qaydalarına riayət etməlidirlər. Dərs saatlarına vaxtında qoşulmaq və tapşırıqları müəyyən olunmuş son tarixə qədər təhvil vermək tələb olunur.'
                  : language === 'ru'
                  ? 'Все студенты, преподаватели и родители, использующие мобильную платформу Thrive, обязаны соблюдать внутренний регламент. Требуется своевременное посещение занятий и сдача заданий в установленный срок.'
                  : 'All students, teachers, and parents using the Thrive platform agree to abide by center regulations, attend classes punctually, and submit assignments before specified deadlines.'}
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {language === 'az'
                  ? '2. Şəxsi Məlumatların Qorunması və Məxfilik'
                  : language === 'ru'
                  ? '2. Защита персональных данных и конфиденциальность'
                  : '2. Privacy & Data Protection'}
              </Text>
              <Text style={styles.sectionBody}>
                {language === 'az'
                  ? 'İstifadəçilərin profilləri, telefon nömrələri, dərs qiymətləri və davamiyyət qeydləri qapalı və şifrələnmiş verilənlər bazasında saxlanılır. Məlumatlar heç bir halda üçüncü şəxslərə ötürülmür və yalnız tədris keyfiyyətinin yüksəldilməsi məqsədilə emal olunur.'
                  : language === 'ru'
                  ? 'Профили пользователей, контактные данные, оценки и посещаемость хранятся в защищенной зашифрованной базе данных и не передаются третьим лицам.'
                  : 'User profile details, phone numbers, academic scores, and attendance records are stored in secure encrypted databases and are never shared with third parties.'}
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {language === 'az'
                  ? '3. Müəllif Hüquqları və Tədris Materialları'
                  : language === 'ru'
                  ? '3. Авторские права и учебные материалы'
                  : '3. Copyright & Study Materials'}
              </Text>
              <Text style={styles.sectionBody}>
                {language === 'az'
                  ? 'Tətbiq üzərindən paylaşılan PDF vəsaitləri, sınaq sualları və müəllim qeydləri Thrive Təhsil Mərkəzinin intellektual mülkiyyətidir və kommersiya məqsədilə kənar resurslarda yayılması qadağandır.'
                  : language === 'ru'
                  ? 'Учебные PDF-материалы, пробные тесты и методические пособия являются интеллектуальной собственностью Thrive и запрещены к распространению на сторонних ресурсах.'
                  : 'All PDF study files, mock questions, and teacher resources shared on the platform are the intellectual property of Thrive and may not be distributed externally.'}
              </Text>
            </View>

            <View style={styles.badgeRow}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.badgeText}>
                {language === 'az'
                  ? 'HacTag Digital Systems tərəfindən qorunur və idarə olunur.'
                  : language === 'ru'
                  ? 'Защищено и поддерживается HacTag Digital Systems.'
                  : 'Secured and maintained by HacTag Digital Systems.'}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <ThriveButton
              title={t('common.close')}
              variant="primary"
              onPress={onClose}
              style={{ width: '100%' }}
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
    maxHeight: '90%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  footer: {
    paddingTop: Spacing.xs,
  },
});

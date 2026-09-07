import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, BookOpen, Award, Clock, Shield, ChevronRight, FileText } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveButton } from '../common/ThriveButton';

interface FAQModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FAQModal: React.FC<FAQModalProps> = ({ visible, onClose }) => {
  const { t, language } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>('q1');

  const faqItems = [
    {
      id: 'q1',
      icon: <Clock size={18} color={Colors.primary} />,
      question:
        language === 'az'
          ? 'Dərs cədvəlimi və otaqları necə görə bilərəm?'
          : language === 'ru'
          ? 'Как просмотреть расписание уроков и аудитории?'
          : 'How can I view my class schedule and room numbers?',
      answer:
        language === 'az'
          ? 'Aşağı menyudan "Cədvəl" bölməsinə keçərək həftənin günləri üzrə bütün dərslərinizi, başlama/bitmə saatlarını, otaq nömrələrini və müəllim məlumatlarını canlı izləyə bilərsiniz.'
          : language === 'ru'
          ? 'Перейдите в раздел «Расписание» в нижнем меню, чтобы просмотреть все уроки по дням недели, время начала и окончания, номера аудиторий и преподавателей.'
          : 'Navigate to the "Schedule" tab from the bottom bar to view your classes by day of week, start/end hours, room numbers, and teacher details in real time.',
    },
    {
      id: 'q2',
      icon: <BookOpen size={18} color={Colors.warning} />,
      question:
        language === 'az'
          ? 'Ev tapşırığını və PDF həll sənədlərini necə təhvil verməliyəm?'
          : language === 'ru'
          ? 'Как сдать домашнее задание и прикрепить PDF-файлы?'
          : 'How do I submit homework and attach PDF solution files?',
      answer:
        language === 'az'
          ? '"Tədris" (Learning) bölməsinə daxil olub müvafiq tapşırığı seçin. Açılan pəncərədə cavabınızı yaza və "+ PDF / Şəkil Qoş" düyməsi ilə həll sənədinizi və ya dəftər şəkillərini yükləyərək təhvil verə bilərsiniz.'
          : language === 'ru'
          ? 'Перейдите в раздел «Обучение», выберите задание, введите ответ и нажмите «+ Прикрепить PDF/Фото», чтобы отправить файл решения или фото тетради.'
          : 'Go to the "Learning" section, select the assignment, enter your notes, and tap "+ Attach PDF/Image" to submit your solution document or notebook photos.',
    },
    {
      id: 'q3',
      icon: <Award size={18} color={Colors.success} />,
      question:
        language === 'az'
          ? 'Sınaq imtahanlarının nəticələri nə vaxt yenilənir?'
          : language === 'ru'
          ? 'Когда обновляются результаты пробных экзаменов?'
          : 'When are mock exam scores updated in the app?',
      answer:
        language === 'az'
          ? 'Müəllim imtahan nəticələrini sistemə daxil etdikdən dərhal sonra "Tədris -> İmtahanlar" bölməsində balınız və fənlər üzrə vizual analitika qrafikləri yenilənir.'
          : language === 'ru'
          ? 'Сразу после внесения результатов преподавателем они отображаются в разделе «Обучение -> Экзамены» вместе с графиками успеваемости.'
          : 'As soon as the teacher submits the exam scores, they appear instantly in "Learning -> Exams" alongside visual analytics and highest score breakdowns.',
    },
    {
      id: 'q4',
      icon: <Shield size={18} color={Colors.primary} />,
      question:
        language === 'az'
          ? 'Hesab təhlükəsizliyi və şifrəni necə dəyişə bilərəm?'
          : language === 'ru'
          ? 'Как изменить пароль и обеспечить безопасность аккаунта?'
          : 'How can I change my password and manage security?',
      answer:
        language === 'az'
          ? '"Profil -> Parametrlər" bölməsinə keçib "Şifrəni Dəyişdir" seçiminə toxunaraq yeni şifrənizi təyin edə bilərsiniz. Həmçinin biometrik giriş (Face ID / Barmaq izi) funksiyasını aktivləşdirə bilərsiniz.'
          : language === 'ru'
          ? 'В разделе «Профиль -> Настройки» нажмите «Сменить пароль». Вы также можете включить биометрический вход (Face ID / Отпечаток пальца).'
          : 'Go to "Profile -> Settings" and tap "Change Password" to update your credentials. You can also enable biometric login (Face ID / Fingerprint) on supported devices.',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <FileText size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>{t('common.faqTitle')}</Text>
                <Text style={styles.subtitle}>{t('common.helpCenter')}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {faqItems.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <View key={item.id} style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(item.id)}
                    style={styles.questionRow}
                  >
                    <View style={styles.questionLeft}>
                      {item.icon}
                      <Text style={styles.questionText}>{item.question}</Text>
                    </View>
                    <ChevronRight
                      size={18}
                      color={isExpanded ? Colors.primary : Colors.textMuted}
                      style={isExpanded ? { transform: [{ rotate: '90deg' }] } : undefined}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.answerBox}>
                      <Text style={styles.answerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
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
  faqCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  faqCardExpanded: {
    borderColor: 'rgba(76, 162, 181, 0.4)',
    backgroundColor: '#0F2744',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  questionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  answerBox: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: Spacing.sm,
  },
  answerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingTop: Spacing.xs,
  },
});

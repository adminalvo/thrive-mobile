import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { TrendingUp, Award, CheckCircle, X } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { StudentExamItem } from '../../types/student.types';
import { ThriveBadge } from '../common/ThriveBadge';
import { ThriveButton } from '../common/ThriveButton';

interface ExamAnalyticsModalProps {
  visible: boolean;
  exams: StudentExamItem[];
  studentName?: string;
  onClose: () => void;
}

export const ExamAnalyticsModal: React.FC<ExamAnalyticsModalProps> = ({
  visible,
  exams,
  studentName,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!visible) return null;

  const gradedExams = exams.filter((e) => e.score !== undefined && e.score !== null);
  const totalExams = exams.length;
  
  let averageScore = 0;
  let highestScore = 0;
  let highestExam: StudentExamItem | null = null;

  if (gradedExams.length > 0) {
    const scores = gradedExams.map((e) => Number(e.score) || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    averageScore = Math.round(sum / gradedExams.length);
    highestScore = Math.max(...scores);
    highestExam = gradedExams.find((e) => Number(e.score) === highestScore) || null;
  }

  // Group by program / subject
  const subjectMap = new Map<string, { totalScore: number; count: number }>();
  gradedExams.forEach((e) => {
    const prog = e.programName || 'Ümumi';
    const current = subjectMap.get(prog) || { totalScore: 0, count: 0 };
    current.totalScore += Number(e.score) || 0;
    current.count += 1;
    subjectMap.set(prog, current);
  });

  const subjectStats = Array.from(subjectMap.entries()).map(([name, data]) => ({
    name,
    avg: Math.round(data.totalScore / data.count),
  }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalSheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.iconCircle}>
                    <TrendingUp size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.title}>{t('analytics.modalTitle')}</Text>
                    {!!studentName && <Text style={styles.subtitle}>{studentName}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* 3 Metric Cards */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{averageScore || '-'}</Text>
                    <Text style={styles.metricLabel}>{t('analytics.averageScore')}</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={[styles.metricValue, { color: Colors.success }]}>
                      {highestScore || '-'}
                    </Text>
                    <Text style={styles.metricLabel}>{t('analytics.highestScore')}</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{totalExams}</Text>
                    <Text style={styles.metricLabel}>{t('analytics.totalExams')}</Text>
                  </View>
                </View>

                {/* Highest Performance Highlight */}
                {highestExam && (
                  <View style={styles.highlightCard}>
                    <View style={styles.highlightHeader}>
                      <Award size={18} color={Colors.warning} />
                      <Text style={styles.highlightTitle}>{t('analytics.performanceStrong')}</Text>
                    </View>
                    <Text style={styles.highlightText}>
                      {highestExam.title} ({highestExam.programName}) —{' '}
                      <Text style={{ color: Colors.primary, fontWeight: '800' }}>
                        {highestExam.score}/{highestExam.maxScore} {t('common.score')}
                      </Text>
                    </Text>
                  </View>
                )}

                {/* Subject Breakdown Bars */}
                <Text style={styles.sectionHeader}>{t('analytics.subjectBreakdown')}</Text>
                {subjectStats.length === 0 ? (
                  <Text style={styles.emptyNote}>{t('student.noExams')}</Text>
                ) : (
                  subjectStats.map((sub, idx) => (
                    <View key={idx} style={styles.subjectItem}>
                      <View style={styles.subjectRow}>
                        <Text style={styles.subjectName}>{sub.name}</Text>
                        <Text style={styles.subjectScore}>{sub.avg} / 100</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${Math.min(100, sub.avg)}%`,
                              backgroundColor:
                                sub.avg >= 80
                                  ? Colors.success
                                  : sub.avg >= 60
                                  ? Colors.primary
                                  : Colors.warning,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))
                )}

                {/* Progress History List */}
                <Text style={styles.sectionHeader}>{t('analytics.progressOverTime')}</Text>
                {exams.slice(0, 5).map((exam) => (
                  <View key={exam.id} style={styles.examHistoryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.examTitle}>{exam.title}</Text>
                      <Text style={styles.examDate}>{exam.examDate}</Text>
                    </View>
                    <ThriveBadge
                      label={exam.score !== undefined ? `${exam.score}/${exam.maxScore}` : t('common.pending')}
                      variant={exam.score !== undefined ? 'primary' : 'warning'}
                    />
                  </View>
                ))}
              </ScrollView>

              <View style={styles.footer}>
                <ThriveButton
                  title={t('common.close')}
                  variant="secondary"
                  onPress={onClose}
                  style={{ width: '100%' }}
                />
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0F2744',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  highlightCard: {
    backgroundColor: '#112F52',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: Spacing.md,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
    textTransform: 'uppercase',
  },
  highlightText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emptyNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  subjectItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs + 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subjectScore: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A3353',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  examHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  examDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footer: {
    paddingTop: Spacing.xs,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { CheckCircle, Clock, FileText, Award, Calendar, Send } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import {
  StudentAssignmentItem,
  StudentExamItem,
  StudentProgressStats,
} from '../../types/student.types';
import { AttendanceRow } from '../../types/database.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { ThriveProgressBar } from '../../components/common/ThriveProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';

type LearningTab = 'assignments' | 'exams' | 'attendance';

export const StudentLearningScreen: React.FC = () => {
  const { session } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<LearningTab>('assignments');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [exams, setExams] = useState<StudentExamItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [progress, setProgress] = useState<StudentProgressStats | null>(null);

  // Submitting modal state
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [savingSubmission, setSavingSubmission] = useState(false);

  const studentId = session?.studentId;

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const loadData = async () => {
    if (!studentId) return;
    try {
      const [ass, ex, att, prog] = await Promise.all([
        studentService.getStudentAssignments(studentId),
        studentService.getStudentExams(studentId),
        studentService.getStudentAttendanceHistory(studentId),
        studentService.getStudentProgress(studentId),
      ]);
      setAssignments(ass);
      setExams(ex);
      setAttendance(att);
      setProgress(prog);
    } catch (e) {
      console.error('Error loading student learning data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!studentId || !submissionText.trim()) return;
    setSavingSubmission(true);
    const res = await studentService.submitAssignment(assignmentId, studentId, submissionText.trim());
    setSavingSubmission(false);
    if (res.success) {
      setSubmittingAssignmentId(null);
      setSubmissionText('');
      loadData();
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (assignmentFilter === 'all') return true;
    return a.status === assignmentFilter;
  });

  return (
    <View style={styles.container}>
      <HeaderBar title="Tədris Mərkəzi" subtitle="Tapşırıqlar, İmtahanlar və Davamiyyət" />

      {/* Main Tabs */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={() => setActiveTab('assignments')}
          style={[styles.segmentBtn, activeTab === 'assignments' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'assignments' && styles.segmentTextActive]}>
            Tapşırıqlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('exams')}
          style={[styles.segmentBtn, activeTab === 'exams' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'exams' && styles.segmentTextActive]}>
            İmtahanlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('attendance')}
          style={[styles.segmentBtn, activeTab === 'attendance' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'attendance' && styles.segmentTextActive]}>
            Davamiyyət
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={3} />
        ) : (
          <>
            {/* 1. ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <View>
                {/* Filter chips */}
                <View style={styles.chipsRow}>
                  {(['all', 'pending', 'submitted', 'graded'] as const).map((filterKey) => (
                    <TouchableOpacity
                      key={filterKey}
                      onPress={() => setAssignmentFilter(filterKey)}
                      style={[
                        styles.chip,
                        assignmentFilter === filterKey && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          assignmentFilter === filterKey && styles.chipTextSelected,
                        ]}
                      >
                        {filterKey === 'all'
                          ? 'Hamısı'
                          : filterKey === 'pending'
                          ? 'Gözləyir'
                          : filterKey === 'submitted'
                          ? 'Təhvil verildi'
                          : 'Qiymətləndirildi'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {filteredAssignments.length === 0 ? (
                  <EmptyState
                    title="Tapşırıq tapılmadı"
                    description="Bu kateqoriya üzrə hazırda aktiv ev tapşırığı yoxdur."
                  />
                ) : (
                  filteredAssignments.map((item) => {
                    const isSubmitting = submittingAssignmentId === item.id;

                    return (
                      <ThriveCard key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                          <ThriveBadge
                            label={item.programName}
                            variant="primary"
                          />
                          <ThriveBadge
                            label={
                              item.status === 'graded'
                                ? `Bal: ${item.score}/${item.maxScore}`
                                : item.status === 'submitted'
                                ? 'Təhvil verildi'
                                : 'Gözləyir'
                            }
                            variant={
                              item.status === 'graded'
                                ? 'success'
                                : item.status === 'submitted'
                                ? 'info'
                                : 'warning'
                            }
                          />
                        </View>

                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {item.description ? (
                          <Text style={styles.itemDesc}>{item.description}</Text>
                        ) : null}

                        {item.dueDate ? (
                          <View style={styles.metaItem}>
                            <Clock size={13} color={Colors.textMuted} />
                            <Text style={styles.metaText}>Son tarix: {item.dueDate}</Text>
                          </View>
                        ) : null}

                        {item.feedback ? (
                          <View style={styles.feedbackBox}>
                            <Text style={styles.feedbackLabel}>Müəllim rəyi:</Text>
                            <Text style={styles.feedbackText}>{item.feedback}</Text>
                          </View>
                        ) : null}

                        {/* Submission trigger */}
                        {item.status === 'pending' && (
                          <>
                            {isSubmitting ? (
                              <View style={styles.submitArea}>
                                <TextInput
                                  placeholder="Cavabınızı və ya qeydlərinizi yazın..."
                                  placeholderTextColor={Colors.textMuted}
                                  multiline
                                  numberOfLines={3}
                                  style={styles.textArea}
                                  value={submissionText}
                                  onChangeText={setSubmissionText}
                                />
                                <View style={styles.submitBtnRow}>
                                  <ThriveButton
                                    title="Ləğv et"
                                    size="sm"
                                    variant="secondary"
                                    onPress={() => {
                                      setSubmittingAssignmentId(null);
                                      setSubmissionText('');
                                    }}
                                  />
                                  <ThriveButton
                                    title="Göndər"
                                    size="sm"
                                    variant="primary"
                                    loading={savingSubmission}
                                    onPress={() => handleSubmitAssignment(item.id)}
                                    icon={<Send size={14} color="#FFFFFF" />}
                                  />
                                </View>
                              </View>
                            ) : (
                              <ThriveButton
                                title="Tapşırığı təhvil ver"
                                size="sm"
                                variant="outline"
                                onPress={() => {
                                  setSubmittingAssignmentId(item.id);
                                  setSubmissionText(item.submissionText || '');
                                }}
                                style={{ marginTop: Spacing.sm }}
                              />
                            )}
                          </>
                        )}
                      </ThriveCard>
                    );
                  })
                )}
              </View>
            )}

            {/* 2. EXAMS TAB */}
            {activeTab === 'exams' && (
              <View>
                {exams.length === 0 ? (
                  <EmptyState
                    title="İmtahan tapılmadı"
                    description="Hazırda qeydə alınmış imtahan və ya sınaq nəticəsi yoxdur."
                  />
                ) : (
                  exams.map((ex) => (
                    <ThriveCard key={ex.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <ThriveBadge label={ex.programName} variant="primary" />
                        {ex.score !== undefined && ex.score !== null ? (
                          <ThriveBadge
                            label={`Nəticə: ${ex.score} / ${ex.maxScore}`}
                            variant="success"
                          />
                        ) : (
                          <ThriveBadge label="Gözlənilir" variant="warning" />
                        )}
                      </View>

                      <Text style={styles.itemTitle}>{ex.title}</Text>
                      <Text style={styles.metaText}>{ex.groupName}</Text>

                      {ex.examDate ? (
                        <View style={styles.metaItem}>
                          <Calendar size={13} color={Colors.textMuted} />
                          <Text style={styles.metaText}>İmtahan tarixi: {ex.examDate}</Text>
                        </View>
                      ) : null}

                      {ex.feedback ? (
                        <View style={styles.feedbackBox}>
                          <Text style={styles.feedbackLabel}>Müəllim rəyi:</Text>
                          <Text style={styles.feedbackText}>{ex.feedback}</Text>
                        </View>
                      ) : null}
                    </ThriveCard>
                  ))
                )}
              </View>
            )}

            {/* 3. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <View>
                {/* Attendance rate hero */}
                <ThriveCard style={styles.attendanceHeroCard}>
                  <Text style={styles.attRateLabel}>Ümumi Davamiyyət Göstəricisi</Text>
                  <Text style={styles.attRateVal}>{progress?.attendanceRate || 100}%</Text>
                  <ThriveProgressBar
                    progress={progress?.attendanceRate || 100}
                    color={Colors.success}
                    height={10}
                    style={{ marginVertical: Spacing.md }}
                  />

                  <View style={styles.attStatsRow}>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.success }]}>
                        {progress?.presentCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>İştirak</Text>
                    </View>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.warning }]}>
                        {progress?.lateCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>Gecikmə</Text>
                    </View>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.danger }]}>
                        {progress?.absentCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>Qayıb</Text>
                    </View>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.primary }]}>
                        {progress?.excusedCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>Üzrlü</Text>
                    </View>
                  </View>
                </ThriveCard>

                <Text style={styles.historyTitle}>Davamiyyət Tarixçəsi</Text>

                {attendance.length === 0 ? (
                  <EmptyState
                    title="Davamiyyət qeydi yoxdur"
                    description="Sistemdə hələlik davamiyyət məlumatı qeydə alınmayıb."
                  />
                ) : (
                  attendance.map((att) => (
                    <ThriveCard key={att.id} style={styles.attendanceRow}>
                      <View style={styles.attDateColumn}>
                        <Text style={styles.attDateText}>{att.date}</Text>
                        {att.notes ? <Text style={styles.attNotes}>{att.notes}</Text> : null}
                      </View>

                      <ThriveBadge
                        label={
                          att.status === 'PRESENT'
                            ? 'İştirak'
                            : att.status === 'LATE'
                            ? 'Gecikdi'
                            : att.status === 'ABSENT'
                            ? 'Qayıb'
                            : 'Üzrlü'
                        }
                        variant={
                          att.status === 'PRESENT'
                            ? 'success'
                            : att.status === 'LATE'
                            ? 'warning'
                            : att.status === 'ABSENT'
                            ? 'danger'
                            : 'info'
                        }
                      />
                    </ThriveCard>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  feedbackBox: {
    backgroundColor: Colors.cardElevated,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginTop: Spacing.sm,
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  submitArea: {
    marginTop: Spacing.md,
    backgroundColor: Colors.cardElevated,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  textArea: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: 14,
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  attendanceHeroCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.3)',
  },
  attRateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  attRateVal: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.success,
    marginVertical: Spacing.xs,
  },
  attStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  attStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  attStatNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  attStatText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.xs + 2,
  },
  attDateColumn: {
    flex: 1,
  },
  attDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  attNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

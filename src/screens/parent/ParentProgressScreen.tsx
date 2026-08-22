import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/studentService';
import { parentService } from '../../services/parentService';
import {
  StudentAssignmentItem,
  StudentExamItem,
  StudentProgressStats,
} from '../../types/student.types';
import { AttendanceRow } from '../../types/database.types';
import { ChildOverview } from '../../types/parent.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveProgressBar } from '../../components/common/ThriveProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';

type ProgressTab = 'attendance' | 'assignments' | 'exams';

export const ParentProgressScreen: React.FC = () => {
  const { session, activeChildId } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ProgressTab>('attendance');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [children, setChildren] = useState<ChildOverview[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [exams, setExams] = useState<StudentExamItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [progress, setProgress] = useState<StudentProgressStats | null>(null);

  const parentId = session?.parentId;

  useEffect(() => {
    if (parentId) {
      loadData();
    }
  }, [parentId, activeChildId]);

  const loadData = async () => {
    if (!parentId) return;
    try {
      const kids = await parentService.getChildren(parentId);
      setChildren(kids);

      const targetChildId = activeChildId || kids[0]?.studentId;
      if (targetChildId) {
        const [ass, ex, att, prog] = await Promise.all([
          studentService.getStudentAssignments(targetChildId),
          studentService.getStudentExams(targetChildId),
          studentService.getStudentAttendanceHistory(targetChildId),
          studentService.getStudentProgress(targetChildId),
        ]);
        setAssignments(ass);
        setExams(ex);
        setAttendance(att);
        setProgress(prog);
      }
    } catch (e) {
      console.error('Error loading parent progress data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeChild = children.find((c) => c.studentId === activeChildId) || children[0];

  return (
    <View style={styles.container}>
      <HeaderBar
        title={t('parent.progressTitle')}
        subtitle={activeChild ? `${activeChild.fullName} • ${t('parent.academicOverview')}` : t('parent.academicOverview')}
      />

      {/* Main Tabs */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={() => setActiveTab('attendance')}
          style={[styles.segmentBtn, activeTab === 'attendance' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'attendance' && styles.segmentTextActive]}>
            {t('nav.schedule')} & {t('parent.attendance')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('assignments')}
          style={[styles.segmentBtn, activeTab === 'assignments' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'assignments' && styles.segmentTextActive]}>
            {t('nav.assignments')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('exams')}
          style={[styles.segmentBtn, activeTab === 'exams' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'exams' && styles.segmentTextActive]}>
            {t('student.examsResults')}
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
            {/* 1. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <View>
                <ThriveCard style={styles.attendanceHeroCard}>
                  <Text style={styles.attRateLabel}>{t('student.overallAttendance')}</Text>
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
                      <Text style={styles.attStatText}>{t('teacher.presentShort')}</Text>
                    </View>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.warning }]}>
                        {progress?.lateCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>{t('teacher.lateShort')}</Text>
                    </View>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.danger }]}>
                        {progress?.absentCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>{t('teacher.absentShort')}</Text>
                    </View>
                    <View style={styles.attStatBox}>
                      <Text style={[styles.attStatNumber, { color: Colors.primary }]}>
                        {progress?.excusedCount || 0}
                      </Text>
                      <Text style={styles.attStatText}>{t('teacher.excusedShort')}</Text>
                    </View>
                  </View>
                </ThriveCard>

                <Text style={styles.historyTitle}>{t('student.attendanceHistory')}</Text>

                {attendance.length === 0 ? (
                  <EmptyState
                    title={t('common.empty')}
                    description={t('student.noAttendance')}
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
                            ? t('teacher.presentShort')
                            : att.status === 'LATE'
                            ? t('teacher.lateShort')
                            : att.status === 'ABSENT'
                            ? t('teacher.absentShort')
                            : t('teacher.excusedShort')
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

            {/* 2. ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <View>
                {assignments.length === 0 ? (
                  <EmptyState
                    title={t('common.empty')}
                    description={t('student.noAssignments')}
                  />
                ) : (
                  assignments.map((item) => (
                    <ThriveCard key={item.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <ThriveBadge label={item.programName} variant="primary" />
                        <ThriveBadge
                          label={
                            item.status === 'graded'
                              ? t('teacher.scoreFormatted', { score: item.score || 0, max: item.maxScore })
                              : item.status === 'submitted'
                              ? t('common.submitted')
                              : t('common.pending')
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
                          <Text style={styles.metaText}>{t('teacher.dueDateFormatted', { date: item.dueDate })}</Text>
                        </View>
                      ) : null}

                      {item.feedback ? (
                        <View style={styles.feedbackBox}>
                          <Text style={styles.feedbackLabel}>{t('student.teacherFeedback')}</Text>
                          <Text style={styles.feedbackText}>{item.feedback}</Text>
                        </View>
                      ) : null}
                    </ThriveCard>
                  ))
                )}
              </View>
            )}

            {/* 3. EXAMS TAB */}
            {activeTab === 'exams' && (
              <View>
                {exams.length === 0 ? (
                  <EmptyState
                    title={t('common.empty')}
                    description={t('student.noExams')}
                  />
                ) : (
                  exams.map((ex) => (
                    <ThriveCard key={ex.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <ThriveBadge label={ex.programName} variant="primary" />
                        {ex.score !== undefined && ex.score !== null ? (
                          <ThriveBadge
                            label={t('student.examResult', { score: ex.score, max: ex.maxScore })}
                            variant="success"
                          />
                        ) : (
                          <ThriveBadge label={t('common.pending')} variant="warning" />
                        )}
                      </View>

                      <Text style={styles.itemTitle}>{ex.title}</Text>
                      <Text style={styles.metaText}>{ex.groupName}</Text>

                      {ex.examDate ? (
                        <View style={styles.metaItem}>
                          <Calendar size={13} color={Colors.textMuted} />
                          <Text style={styles.metaText}>{t('student.examDate', { date: ex.examDate })}</Text>
                        </View>
                      ) : null}

                      {ex.feedback ? (
                        <View style={styles.feedbackBox}>
                          <Text style={styles.feedbackLabel}>{t('student.teacherFeedback')}</Text>
                          <Text style={styles.feedbackText}>{ex.feedback}</Text>
                        </View>
                      ) : null}
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
});

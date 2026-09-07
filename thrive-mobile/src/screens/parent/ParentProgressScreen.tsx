import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Clock, Calendar, TrendingUp, Check, BookOpen } from 'lucide-react-native';
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
import { ExamAnalyticsModal } from '../../components/modals/ExamAnalyticsModal';
import { filePickerService } from '../../utils/filePickerService';
import { AttachmentList } from '../../components/common/AttachmentList';

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
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

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
        subtitle={activeChild ? `${activeChild.fullName} • ${t('parent.progressSubtitle')}` : t('parent.progressSubtitle')}
      />

      {/* Main Tabs */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={() => setActiveTab('attendance')}
          style={[styles.segmentBtn, activeTab === 'attendance' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'attendance' && styles.segmentTextActive]}>
            {t('common.attendance')}
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
            {t('student.tabExams')}
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
                  <Text style={styles.attRateLabel}>{t('student.attendanceRate')}</Text>
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

                <Text style={styles.historyTitle}>{t('student.tabAttendance')}</Text>

                {attendance.length === 0 ? (
                  <EmptyState
                    title={t('common.empty')}
                    description={t('student.noAttendance')}
                  />
                ) : (
                  attendance.map((att) => {
                    let noteText = att.notes || '';
                    let lessonTopic = '';
                    let dailyScore: number | null = null;

                    if (att.notes && att.notes.trim().startsWith('{') && att.notes.trim().endsWith('}')) {
                      try {
                        const parsed = JSON.parse(att.notes);
                        noteText = parsed.notes || '';
                        lessonTopic = parsed.lessonTopic || '';
                        dailyScore = typeof parsed.dailyScore === 'number' ? parsed.dailyScore : null;
                      } catch {}
                    }

                    return (
                      <ThriveCard key={att.id} style={styles.attendanceRow}>
                        <View style={styles.attDateColumn}>
                          <Text style={styles.attDateText}>{att.date}</Text>
                          {!!lessonTopic && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <BookOpen size={12} color={Colors.primary} />
                              <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: '600' }}>
                                {lessonTopic}
                              </Text>
                            </View>
                          )}
                          {dailyScore !== null && (
                            <Text style={{ fontSize: 12, color: Colors.warning, fontWeight: '700', marginTop: 2 }}>
                              ⭐ {t('teacher.dailyGrade')}: {dailyScore}/10
                            </Text>
                          )}
                          {!!noteText && <Text style={styles.attNotes}>{noteText}</Text>}
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
                    );
                  })
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
                  assignments.map((item) => {
                    const { cleanText: descText, attachments: teacherMaterials } =
                      filePickerService.unpackAttachments(item.description || '');

                    const { cleanText: studentAnswer, attachments: studentFiles } =
                      filePickerService.unpackAttachments(item.submissionText || '');

                    return (
                      <ThriveCard key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                          <ThriveBadge label={item.programName} variant="primary" />
                          <ThriveBadge
                            label={
                              item.status === 'graded'
                                ? item.score !== undefined ? `${item.score}/${item.maxScore} ${t('common.score')}` : t('common.graded')
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
                        <Text style={styles.groupSubText}>{item.groupName}</Text>

                        {!!descText && <Text style={styles.itemDesc}>{descText}</Text>}

                        {/* Teacher's Materials (PDF) */}
                        {teacherMaterials.length > 0 && (
                          <View style={styles.materialsBox}>
                            <AttachmentList
                              attachments={teacherMaterials}
                              readOnly
                              title={t('attachments.studyMaterialsLabel')}
                            />
                          </View>
                        )}

                        {item.dueDate ? (
                          <View style={styles.metaItem}>
                            <Clock size={13} color={Colors.textMuted} />
                            <Text style={styles.metaText}>{t('teacher.dueDateFormatted', { date: item.dueDate })}</Text>
                          </View>
                        ) : null}

                        {/* Child's Submission Details */}
                        {(item.status === 'submitted' || item.status === 'graded') && (
                          <View style={styles.submittedBox}>
                            <View style={styles.submittedHeader}>
                              <Check size={14} color={Colors.success} />
                              <Text style={styles.submittedTitle}>{t('parent.childSubmittedAnswer')}</Text>
                            </View>
                            {!!studentAnswer && <Text style={styles.submittedText}>{studentAnswer}</Text>}
                            {studentFiles.length > 0 && (
                              <AttachmentList
                                attachments={studentFiles}
                                readOnly
                                title={t('attachments.attachedSolutionsDocLabel')}
                              />
                            )}
                          </View>
                        )}

                        {item.feedback ? (
                          <View style={styles.feedbackBox}>
                            <Text style={styles.feedbackLabel}>{t('common.feedback')}:</Text>
                            <Text style={styles.feedbackText}>{item.feedback}</Text>
                          </View>
                        ) : null}
                      </ThriveCard>
                    );
                  })
                )}
              </View>
            )}

            {/* 3. EXAMS TAB */}
            {activeTab === 'exams' && (
              <View>
                {exams.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAnalyticsModalVisible(true)}
                    style={styles.analyticsBanner}
                  >
                    <View style={styles.analyticsBannerLeft}>
                      <TrendingUp size={20} color={Colors.primary} />
                      <View>
                        <Text style={styles.analyticsBannerTitle}>{t('analytics.modalTitle')}</Text>
                        <Text style={styles.analyticsBannerDesc}>{t('analytics.scoreTrend')}</Text>
                      </View>
                    </View>
                    <ThriveBadge label={t('common.view')} variant="primary" />
                  </TouchableOpacity>
                )}

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
                            label={`${ex.score} / ${ex.maxScore} ${t('common.score')}`}
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
                          <Text style={styles.metaText}>{ex.examDate}</Text>
                        </View>
                      ) : null}

                      {ex.feedback ? (
                        <View style={styles.feedbackBox}>
                          <Text style={styles.feedbackLabel}>{t('common.feedback')}:</Text>
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

      {/* EXAM ANALYTICS MODAL */}
      <ExamAnalyticsModal
        visible={analyticsModalVisible}
        exams={exams}
        studentName={activeChild?.fullName}
        onClose={() => setAnalyticsModalVisible(false)}
      />
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
    backgroundColor: '#0F2744',
    borderColor: 'rgba(76, 162, 181, 0.3)',
    marginBottom: Spacing.lg,
  },
  attRateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  attRateVal: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.success,
    marginTop: 2,
  },
  attStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  attStatBox: {
    alignItems: 'center',
  },
  attStatNumber: {
    fontSize: 16,
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
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  groupSubText: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  materialsBox: {
    backgroundColor: '#0F2744',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
  },
  submittedBox: {
    backgroundColor: '#0A1E38',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  submittedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  submittedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
    textTransform: 'uppercase',
  },
  submittedText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
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
    backgroundColor: '#0A1E38',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.2)',
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  analyticsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F2744',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(76, 162, 181, 0.35)',
    marginBottom: Spacing.md,
  },
  analyticsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  analyticsBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  analyticsBannerDesc: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Plus, Clock, FileCheck, CheckCircle2, Award, FileText } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import {
  TeacherGroupItem,
  TeacherSubmissionToGrade,
} from '../../types/teacher.types';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ThriveCard } from '../../components/common/ThriveCard';
import { ThriveBadge } from '../../components/common/ThriveBadge';
import { ThriveButton } from '../../components/common/ThriveButton';
import { SkeletonCardList } from '../../components/common/ThriveSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { CreateAssignmentModal } from '../../components/modals/CreateAssignmentModal';
import { GradeSubmissionModal } from '../../components/modals/GradeSubmissionModal';
import { filePickerService } from '../../utils/filePickerService';
import { AttachmentList } from '../../components/common/AttachmentList';

type AssignmentTab = 'active' | 'submissions';

export const TeacherAssignmentsScreen: React.FC = () => {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AssignmentTab>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [groups, setGroups] = useState<TeacherGroupItem[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<TeacherSubmissionToGrade[]>([]);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedAssignmentToEdit, setSelectedAssignmentToEdit] = useState<any | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<TeacherSubmissionToGrade | null>(null);

  const teacherId = session?.teacherId;

  useEffect(() => {
    if (teacherId) {
      loadData();
    }
  }, [teacherId]);

  const loadData = async () => {
    if (!teacherId) return;
    try {
      const [allGroups, allAss, allSubs] = await Promise.all([
        teacherService.getTeacherGroups(teacherId),
        teacherService.getTeacherAssignments(teacherId),
        teacherService.getSubmissionsToGrade(),
      ]);

      setGroups(allGroups);
      setAssignments(allAss);
      setSubmissions(allSubs);
    } catch (e) {
      console.error('Error loading teacher assignments data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={t('teacher.assignmentsTitle')} subtitle={t('teacher.assignmentsSubtitle')} />

      {/* Main Tabs */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
            {t('teacher.activeAssignments')} ({assignments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('submissions')}
          style={[styles.segmentBtn, activeTab === 'submissions' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeTab === 'submissions' && styles.segmentTextActive]}>
            {t('teacher.submissions')} ({submissions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Button Toolbar */}
      {activeTab === 'active' && (
        <View style={styles.toolbar}>
          <ThriveButton
            title={t('teacher.newAssignmentBtn')}
            size="sm"
            variant="primary"
            onPress={() => setCreateModalVisible(true)}
            icon={<Plus size={16} color="#FFFFFF" />}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <SkeletonCardList count={3} />
        ) : activeTab === 'active' ? (
          assignments.length === 0 ? (
            <EmptyState
              title={t('common.empty')}
              description={t('teacher.noActiveAssignments')}
            />
          ) : (
            assignments.map((item) => {
              const { cleanText: descText, attachments: materials } =
                filePickerService.unpackAttachments(item.description || '');

              return (
                <ThriveCard key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <ThriveBadge label={item.groupName} variant="primary" />
                    <Text style={styles.maxScoreText}>{t('teacher.maxScoreFormatted', { max: item.maxScore })}</Text>
                  </View>

                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {!!descText && <Text style={styles.itemDesc}>{descText}</Text>}

                  {/* Attached PDF Materials */}
                  {materials.length > 0 && (
                    <View style={styles.materialsBox}>
                      <AttachmentList
                        attachments={materials}
                        readOnly
                        title={t('attachments.studyMaterialsLabel')}
                      />
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    {item.dueDate ? (
                      <View style={styles.metaRow}>
                        <Clock size={13} color={Colors.textMuted} />
                        <Text style={styles.metaText}>{t('teacher.dueDateFormatted', { date: item.dueDate })}</Text>
                      </View>
                    ) : <View />}

                    <ThriveButton
                      title={t('common.edit')}
                      size="sm"
                      variant="outline"
                      onPress={() => setSelectedAssignmentToEdit(item)}
                    />
                  </View>
                </ThriveCard>
              );
            })
          )
        ) : (
          submissions.length === 0 ? (
            <EmptyState
              title={t('common.empty')}
              description={t('teacher.noSubmissions')}
            />
          ) : (
            submissions.map((sub) => {
              const { cleanText, attachments } = filePickerService.unpackAttachments(
                sub.submissionText || ''
              );

              return (
                <ThriveCard key={sub.submissionId} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <ThriveBadge label={sub.groupName} variant="primary" />
                      <Text style={styles.studentName}>{sub.studentName}</Text>
                    </View>

                    <ThriveBadge
                      label={
                        sub.status === 'graded'
                          ? sub.score !== null ? `${sub.score}/${sub.maxScore}` : t('teacher.gradedBadge')
                          : t('teacher.pendingBadge')
                      }
                      variant={sub.status === 'graded' ? 'success' : 'warning'}
                    />
                  </View>

                  <Text style={styles.subAssTitle}>{sub.assignmentTitle}</Text>

                  {/* Student Answer preview */}
                  {!!cleanText && (
                    <View style={styles.answerBox}>
                      <Text style={styles.answerLabel}>{t('teacher.studentAnswerLabel')}</Text>
                      <Text style={styles.answerText} numberOfLines={2}>
                        {cleanText}
                      </Text>
                    </View>
                  )}

                  {/* Student Attachments preview */}
                  {attachments.length > 0 && (
                    <View style={{ marginVertical: Spacing.xs }}>
                      <AttachmentList
                        attachments={attachments}
                        readOnly
                        title={t('teacher.studentSubmittedFiles')}
                      />
                    </View>
                  )}

                  {/* Teacher Feedback if already graded */}
                  {sub.feedback ? (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackLabel}>{t('common.feedback')}:</Text>
                      <Text style={styles.feedbackText}>{sub.feedback}</Text>
                    </View>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.metaText}>{sub.submittedAt ? sub.submittedAt.split('T')[0] : ''}</Text>
                    <ThriveButton
                      title={sub.status === 'graded' ? t('teacher.changeGradeBtn') : t('teacher.gradeNowBtn')}
                      size="sm"
                      variant={sub.status === 'graded' ? 'secondary' : 'primary'}
                      onPress={() => setSelectedSubmission(sub)}
                    />
                  </View>
                </ThriveCard>
              );
            })
          )
        )}
      </ScrollView>

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      <CreateAssignmentModal
        visible={createModalVisible || !!selectedAssignmentToEdit}
        groups={groups}
        assignmentToEdit={selectedAssignmentToEdit}
        onClose={() => {
          setCreateModalVisible(false);
          setSelectedAssignmentToEdit(null);
        }}
        onSuccess={() => {
          setSelectedAssignmentToEdit(null);
          loadData();
        }}
      />

      {/* GRADE SUBMISSION MODAL */}
      <GradeSubmissionModal
        visible={!!selectedSubmission}
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onSuccess={() => loadData()}
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  maxScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subAssTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  answerBox: {
    backgroundColor: '#0F2744',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(76, 162, 181, 0.25)',
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  answerText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  feedbackBox: {
    backgroundColor: '#0A1E38',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginVertical: Spacing.xs,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
});

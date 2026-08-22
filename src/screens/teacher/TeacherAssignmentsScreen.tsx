import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Plus, Clock, FileCheck, CheckCircle2, Award } from 'lucide-react-native';
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
            assignments.map((item) => (
              <ThriveCard key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <ThriveBadge label={item.groupName} variant="primary" />
                  <Text style={styles.maxScoreText}>{t('teacher.maxScoreFormatted', { max: item.maxScore })}</Text>
                </View>

                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                ) : null}

                {item.dueDate ? (
                  <View style={styles.metaRow}>
                    <Clock size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{t('teacher.dueDateFormatted', { date: item.dueDate })}</Text>
                  </View>
                ) : null}
              </ThriveCard>
            ))
          )
        ) : (
          submissions.length === 0 ? (
            <EmptyState
              title={t('common.empty')}
              description={t('teacher.noSubmissions')}
            />
          ) : (
            submissions.map((sub) => (
              <ThriveCard key={sub.submissionId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <ThriveBadge label={sub.groupName} variant="primary" />
                  <ThriveBadge
                    label={
                      sub.status === 'graded'
                        ? t('teacher.scoreFormatted', { score: sub.score || 0, max: sub.maxScore })
                        : t('teacher.pendingBadge')
                    }
                    variant={sub.status === 'graded' ? 'success' : 'warning'}
                  />
                </View>

                <Text style={styles.studentName}>{sub.studentName}</Text>
                <Text style={styles.assignmentTitle}>{sub.assignmentTitle}</Text>

                {sub.submissionText ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>{t('teacher.studentAnswerLabel')}</Text>
                    <Text style={styles.answerText} numberOfLines={2}>
                      {sub.submissionText}
                    </Text>
                  </View>
                ) : null}

                <ThriveButton
                  title={sub.status === 'graded' ? t('teacher.changeGradeBtn') : t('teacher.gradeNowBtn')}
                  size="sm"
                  variant={sub.status === 'graded' ? "outline" : "primary"}
                  onPress={() => setSelectedSubmission(sub)}
                  style={{ marginTop: Spacing.sm }}
                />
              </ThriveCard>
            ))
          )
        )}
      </ScrollView>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        visible={createModalVisible}
        groups={groups}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => loadData()}
      />

      {/* Grade Submission Modal */}
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maxScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  assignmentTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  answerBox: {
    backgroundColor: Colors.cardElevated,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginVertical: Spacing.xs,
  },
  answerLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  answerText: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 2,
  },
});

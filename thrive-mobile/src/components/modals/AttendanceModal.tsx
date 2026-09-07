import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  X,
  UserCheck,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  CheckCircle,
  Lock,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { teacherService } from '../../services/teacherService';
import { hapticService } from '../../utils/hapticService';
import { TeacherStudentRosterItem } from '../../types/teacher.types';
import { AttendanceStatus } from '../../types/database.types';
import { ThriveButton } from '../common/ThriveButton';
import { ThriveAvatar } from '../common/ThriveAvatar';
import { ThriveBadge } from '../common/ThriveBadge';
import { ThriveInput } from '../common/ThriveInput';

interface AttendanceModalProps {
  visible: boolean;
  groupId: string;
  groupName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StudentJournalEntry {
  status: AttendanceStatus;
  dailyScore: number | null;
  publicNotes: string;
  privateNotes: string;
  notesExpanded?: boolean;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible,
  groupId,
  groupName,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<TeacherStudentRosterItem[]>([]);
  const [journalMap, setJournalMap] = useState<Record<string, StudentJournalEntry>>({});

  const [lessonTopic, setLessonTopic] = useState('');
  const [classworkSummary, setClassworkSummary] = useState('');
  const [topicExpanded, setTopicExpanded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isPastDate = currentDate < todayStr;

  useEffect(() => {
    if (visible && groupId) {
      loadRosterAndLog(currentDate);
    }
  }, [visible, groupId, currentDate]);

  const loadRosterAndLog = async (dateStr: string) => {
    setLoading(true);
    try {
      const [roster, lessonLog] = await Promise.all([
        teacherService.getGroupRoster(groupId, dateStr, false),
        teacherService.getGroupLessonLog(groupId, dateStr),
      ]);

      setStudents(roster);
      setLessonTopic(lessonLog.lessonTopic || '');
      setClassworkSummary(lessonLog.classworkSummary || '');

      const initialMap: Record<string, StudentJournalEntry> = {};
      roster.forEach((s: TeacherStudentRosterItem) => {
        initialMap[s.studentId] = {
          status: s.attendanceStatus || 'PRESENT',
          dailyScore: s.dailyScore ?? null,
          publicNotes: s.notes || '',
          privateNotes: s.privateNotes || '',
          notesExpanded: Boolean(s.notes || s.privateNotes),
        };
      });
      setJournalMap(initialMap);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftDate = (days: number) => {
    hapticService.selection();
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    const nextDate = d.toISOString().split('T')[0];
    setCurrentDate(nextDate);
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    if (isPastDate) return;
    hapticService.selection();
    setJournalMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { dailyScore: null, publicNotes: '', privateNotes: '', notesExpanded: false }),
        status,
      },
    }));
  };

  const handleSetScore = (studentId: string, score: number | null) => {
    if (isPastDate) return;
    hapticService.selection();
    setJournalMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'PRESENT', publicNotes: '', privateNotes: '', notesExpanded: false }),
        dailyScore: score,
      },
    }));
  };

  const handleSetPublicNote = (studentId: string, text: string) => {
    if (isPastDate) return;
    setJournalMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'PRESENT', dailyScore: null, privateNotes: '', notesExpanded: false }),
        publicNotes: text,
      },
    }));
  };

  const handleSetPrivateNote = (studentId: string, text: string) => {
    if (isPastDate) return;
    setJournalMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'PRESENT', dailyScore: null, publicNotes: '', notesExpanded: false }),
        privateNotes: text,
      },
    }));
  };

  const toggleStudentNotes = (studentId: string) => {
    hapticService.selection();
    setJournalMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'PRESENT', dailyScore: null, publicNotes: '', privateNotes: '', notesExpanded: false }),
        notesExpanded: !prev[studentId]?.notesExpanded,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    if (isPastDate) return;
    hapticService.medium();
    const updated: Record<string, StudentJournalEntry> = { ...journalMap };
    students.forEach((s) => {
      const existing = updated[s.studentId] || { dailyScore: null, publicNotes: '', privateNotes: '', notesExpanded: false };
      updated[s.studentId] = {
        ...existing,
        status: 'PRESENT',
      };
    });
    setJournalMap(updated);
  };

  const handleSave = async () => {
    if (isPastDate) return;
    setSaving(true);
    const attendancePayload = students.map((s) => {
      const entry = journalMap[s.studentId] || {
        status: 'PRESENT',
        dailyScore: null,
        publicNotes: '',
        privateNotes: '',
      };
      return {
        studentId: s.studentId,
        status: entry.status,
        dailyScore: entry.dailyScore,
        notes: entry.publicNotes.trim() || undefined,
        privateNotes: entry.privateNotes.trim() || undefined,
      };
    });

    onSuccess && onSuccess();
    onClose();

    teacherService.saveAttendance(
      groupId,
      currentDate,
      attendancePayload,
      lessonTopic.trim(),
      classworkSummary.trim()
    ).finally(() => {
      setSaving(false);
    });
  };

  // Status counts
  const presentCount = students.filter((s) => (journalMap[s.studentId]?.status || 'PRESENT') === 'PRESENT').length;
  const lateCount = students.filter((s) => journalMap[s.studentId]?.status === 'LATE').length;
  const absentCount = students.filter((s) => journalMap[s.studentId]?.status === 'ABSENT').length;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t('teacher.attendanceTitle')}</Text>
            <Text style={styles.groupSubtitle}>{groupName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Date Selector Navigation Bar */}
        <View style={styles.dateBar}>
          <TouchableOpacity
            style={styles.dateArrowBtn}
            onPress={() => handleShiftDate(-1)}
          >
            <ChevronLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.dateText}>{currentDate}</Text>
            {currentDate === todayStr && (
              <ThriveBadge label={t('teacher.todayPreset')} variant="primary" />
            )}
            {currentDate === yesterdayStr && (
              <ThriveBadge label={t('teacher.yesterdayPreset')} variant="warning" />
            )}
            {isPastDate && (
              <View style={styles.lockedPill}>
                <Lock size={12} color="#EF4444" />
                <Text style={styles.lockedPillText}>QAPALI</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.dateArrowBtn}
            onPress={() => handleShiftDate(1)}
          >
            <ChevronRight size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Prominent Past Date Restriction Banner */}
        {isPastDate && (
          <View style={styles.pastLockedBanner}>
            <Lock size={16} color="#EF4444" />
            <Text style={styles.pastLockedText}>
              {t('teacher.pastDateLocked')}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('teacher.studentsLoading')}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Lesson Topic & Classwork Card */}
            <View style={styles.lessonCard}>
              <TouchableOpacity
                style={styles.lessonHeaderRow}
                activeOpacity={0.7}
                onPress={() => setTopicExpanded(!topicExpanded)}
              >
                <View style={styles.lessonHeaderLeft}>
                  <BookOpen size={18} color={Colors.primary} />
                  <Text style={styles.lessonCardTitle}>{t('teacher.lessonTopic')}</Text>
                </View>
                <Text style={styles.expandText}>
                  {topicExpanded ? '▲ ' + t('common.close') : '▼ ' + (isPastDate ? t('common.view') : t('common.edit'))}
                </Text>
              </TouchableOpacity>

              {topicExpanded && (
                <View style={styles.lessonBody}>
                  <ThriveInput
                    placeholder={t('teacher.lessonTopicPlaceholder')}
                    value={lessonTopic}
                    onChangeText={setLessonTopic}
                    editable={!isPastDate}
                    leftIcon={<BookOpen size={16} color={Colors.primary} />}
                  />
                  <TextInput
                    style={[styles.classworkArea, isPastDate && { opacity: 0.7 }]}
                    multiline
                    numberOfLines={2}
                    editable={!isPastDate}
                    placeholder={t('teacher.classworkSummaryPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    value={classworkSummary}
                    onChangeText={setClassworkSummary}
                  />
                </View>
              )}
            </View>

            {/* Quick Actions & Status Metrics */}
            <View style={styles.toolbar}>
              {!isPastDate ? (
                <ThriveButton
                  title={t('teacher.markAllPresent')}
                  size="sm"
                  variant="outline"
                  onPress={handleMarkAllPresent}
                  icon={<UserCheck size={16} color={Colors.primary} />}
                />
              ) : (
                <View style={styles.readOnlyBadge}>
                  <Lock size={14} color={Colors.textMuted} />
                  <Text style={styles.readOnlyText}>Tarix Arxivləşdirilib</Text>
                </View>
              )}
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryText}>
                  {t('teacher.markedStatusCount', {
                    present: presentCount,
                    late: lateCount,
                    absent: absentCount,
                  })}
                </Text>
              </View>
            </View>

            {/* Student Roster List */}
            {students.map((student) => {
              const entry = journalMap[student.studentId] || {
                status: 'PRESENT',
                dailyScore: null,
                publicNotes: '',
                privateNotes: '',
                notesExpanded: false,
              };

              return (
                <View key={student.studentId} style={[styles.studentCard, isPastDate && { opacity: 0.9 }]}>
                  {/* Student Top Row */}
                  <View style={styles.studentInfoRow}>
                    <ThriveAvatar name={student.fullName} size={38} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.fullName}</Text>
                      <Text style={styles.studentContact}>
                        {student.phone || student.email || t('common.student')}
                      </Text>
                    </View>

                    {/* Note Drawer Toggle Button */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleStudentNotes(student.studentId)}
                      style={[
                        styles.noteToggleBtn,
                        (entry.publicNotes || entry.privateNotes) && styles.noteToggleBtnActive,
                      ]}
                    >
                      <FileText
                        size={16}
                        color={
                          entry.publicNotes || entry.privateNotes
                            ? Colors.warning
                            : Colors.textMuted
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Attendance Status Selector Buttons */}
                  <View style={styles.statusButtonsRow}>
                    <TouchableOpacity
                      activeOpacity={isPastDate ? 1 : 0.8}
                      disabled={isPastDate}
                      onPress={() => handleSetStatus(student.studentId, 'PRESENT')}
                      style={[
                        styles.statusBtn,
                        entry.status === 'PRESENT' && styles.statusBtnPresent,
                        isPastDate && entry.status !== 'PRESENT' && { opacity: 0.35 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          entry.status === 'PRESENT' && styles.statusBtnTextActive,
                        ]}
                      >
                        {t('teacher.presentShort')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={isPastDate ? 1 : 0.8}
                      disabled={isPastDate}
                      onPress={() => handleSetStatus(student.studentId, 'LATE')}
                      style={[
                        styles.statusBtn,
                        entry.status === 'LATE' && styles.statusBtnLate,
                        isPastDate && entry.status !== 'LATE' && { opacity: 0.35 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          entry.status === 'LATE' && styles.statusBtnTextActive,
                        ]}
                      >
                        {t('teacher.lateShort')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={isPastDate ? 1 : 0.8}
                      disabled={isPastDate}
                      onPress={() => handleSetStatus(student.studentId, 'ABSENT')}
                      style={[
                        styles.statusBtn,
                        entry.status === 'ABSENT' && styles.statusBtnAbsent,
                        isPastDate && entry.status !== 'ABSENT' && { opacity: 0.35 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          entry.status === 'ABSENT' && styles.statusBtnTextActive,
                        ]}
                      >
                        {t('teacher.absentShort')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={isPastDate ? 1 : 0.8}
                      disabled={isPastDate}
                      onPress={() => handleSetStatus(student.studentId, 'EXCUSED')}
                      style={[
                        styles.statusBtn,
                        entry.status === 'EXCUSED' && styles.statusBtnExcused,
                        isPastDate && entry.status !== 'EXCUSED' && { opacity: 0.35 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          entry.status === 'EXCUSED' && styles.statusBtnTextActive,
                        ]}
                      >
                        {t('teacher.excusedShort')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Daily Performance Score Selector */}
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreLeft}>
                      <Award size={14} color={Colors.warning} />
                      <Text style={styles.scoreLabel}>{t('teacher.dailyGrade')}:</Text>
                    </View>
                    <View style={styles.scoreChipsRow}>
                      {[10, 9, 8, 7, 5].map((sc) => {
                        const isSelected = entry.dailyScore === sc;
                        return (
                          <TouchableOpacity
                            key={sc}
                            disabled={isPastDate}
                            onPress={() => handleSetScore(student.studentId, isSelected ? null : sc)}
                            style={[
                              styles.scoreChip,
                              isSelected && styles.scoreChipActive,
                              isPastDate && !isSelected && { opacity: 0.35 },
                            ]}
                          >
                            <Text style={[styles.scoreChipText, isSelected && styles.scoreChipTextActive]}>
                              {sc}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Expandable Notes Section */}
                  {entry.notesExpanded && (
                    <View style={styles.notesDrawer}>
                      <Text style={styles.notesDrawerLabel}>{t('teacher.publicRemark')}</Text>
                      <TextInput
                        style={styles.notesInput}
                        editable={!isPastDate}
                        placeholder={t('teacher.publicRemarkPlaceholder')}
                        placeholderTextColor={Colors.textMuted}
                        value={entry.publicNotes}
                        onChangeText={(txt: string) => handleSetPublicNote(student.studentId, txt)}
                      />

                      <Text style={[styles.notesDrawerLabel, { marginTop: Spacing.xs }]}>
                        {t('teacher.privateRemark')}
                      </Text>
                      <TextInput
                        style={styles.notesInput}
                        editable={!isPastDate}
                        placeholder={t('teacher.privateRemarkPlaceholder')}
                        placeholderTextColor={Colors.textMuted}
                        value={entry.privateNotes}
                        onChangeText={(txt: string) => handleSetPrivateNote(student.studentId, txt)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Save Footer */}
        <View style={styles.footer}>
          {!isPastDate ? (
            <ThriveButton
              title={saving ? t('common.loading') : t('teacher.saveJournalAndAttendance')}
              variant="primary"
              onPress={handleSave}
              loading={saving}
              icon={<CheckCircle size={18} color="#FFFFFF" />}
            />
          ) : (
            <View style={styles.lockedFooterBox}>
              <Lock size={18} color={Colors.textMuted} />
              <Text style={styles.lockedFooterText}>
                Tarixi keçmiş dərs — Yalnız oxu rejimi
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.cardElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  groupSubtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: '#0F2744',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateArrowBtn: {
    padding: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  lockedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  pastLockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  pastLockedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  lessonCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  lessonBody: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  classworkArea: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    color: Colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
    minHeight: 56,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: Radius.md,
  },
  readOnlyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  summaryBadge: {
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  studentCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  studentContact: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  noteToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteToggleBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusBtnPresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: Colors.success,
  },
  statusBtnLate: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: Colors.warning,
  },
  statusBtnAbsent: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: Colors.danger,
  },
  statusBtnExcused: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: Colors.info,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  statusBtnTextActive: {
    color: Colors.textPrimary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  scoreChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChip: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreChipActive: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  scoreChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  scoreChipTextActive: {
    color: '#000000',
  },
  notesDrawer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: Spacing.xs,
  },
  notesDrawerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  notesInput: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.md,
  },
  lockedFooterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  lockedFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});

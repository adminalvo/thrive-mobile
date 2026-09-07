'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import { Plus, BookOpen, CheckCircle2, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherHomeworkPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [groups, setGroups] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  // Grading Modal State
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState(90);
  const [gradeFeedback, setGradeFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [dash, assignList, subList] = await Promise.all([
      realDbService.getTeacherDashboard(profile?.teacherId),
      realDbService.getAssignments(),
      realDbService.getAssignmentSubmissions()
    ]);

    setGroups(dash.groups || []);
    if (dash.groups && dash.groups.length > 0) {
      setSelectedGroupId(dash.groups[0].id);
    }
    setAssignments(assignList);
    setSubmissions(subList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedGroupId) {
      toast.error(locale === 'az' ? 'Başlıq və qrup mütləqdir' : 'Title and Group are required');
      return;
    }

    setSubmitting(true);
    const res = await realDbService.createAssignment({
      title,
      description,
      group_id: selectedGroupId,
      max_score: maxScore
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(locale === 'az' ? 'Yeni tapşırıq yaradıldı!' : 'Assignment created!');
      setIsCreating(false);
      setTitle('');
      setDescription('');
      loadData();
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedSub) return;
    const res = await realDbService.gradeSubmission(selectedSub.id, gradeScore, gradeFeedback);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(locale === 'az' ? 'Qiymət təsdiqləndi!' : 'Grade updated successfully!');
      setSelectedSub(null);
      loadData();
    }
  };

  return (
    <PortalLayout title={t('nav.homework')}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {locale === 'az' ? 'Ev Tapşırıqları və Qiymətləndirmə' : 'Assignments & Evaluations'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Qruplar üçün real vaxtda tapşırıqlar təyin edin və tələbə işlərini yoxlayın' : 'Assign real course tasks and grade student submissions'}
              </p>
            </div>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>{locale === 'az' ? 'Yeni Tapşırıq Təyin Et' : 'Create Assignment'}</span>
            </Button>
          </div>

          {/* Active Assignments */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {locale === 'az' ? 'Təyin Olunmuş Tapşırıqlar' : 'Active Assigned Tasks'} ({assignments.length})
            </h4>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
            ) : assignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-[#070F1E] rounded-2xl border border-slate-800">
                {locale === 'az' ? 'Hələlik heç bir tapşırıq təyin edilməyib' : 'No assignments created yet'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((as) => (
                  <div key={as.id} className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-white">{as.title}</h5>
                      <Badge variant="teal">{as.groups?.name || 'General'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{as.description || 'No description provided'}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                      <span>Max Bal: {as.max_score}</span>
                      <span>Son Tarix: {as.due_date ? new Date(as.due_date).toLocaleDateString() : 'Açıq'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submissions Section */}
          <div className="space-y-4 pt-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {locale === 'az' ? 'Tələbə Göndərişləri' : 'Student Submissions'} ({submissions.length})
            </h4>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-[#070F1E] rounded-2xl border border-slate-800">
                {locale === 'az' ? 'Hələlik heç bir tələbə tapşırıq göndərməyib' : 'No submissions received yet'}
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {submissions.map((sub) => (
                  <div key={sub.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {sub.students?.user_profiles ? `${sub.students.user_profiles.first_name || ''} ${sub.students.user_profiles.last_name || ''}`.trim() : 'Student'}
                      </h5>
                      <p className="text-xs text-slate-400">{sub.assignments?.title} • {sub.content || 'Content submitted'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {sub.score !== null ? (
                        <Badge variant="green">{sub.score} / {sub.assignments?.max_score || 100}</Badge>
                      ) : (
                        <Button size="sm" onClick={() => { setSelectedSub(sub); setGradeScore(90); }}>
                          {locale === 'az' ? 'Qiymətləndir' : 'Grade'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal: Create Assignment */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title={locale === 'az' ? 'Yeni Tapşırıq Təyin Et' : 'Create Assignment'}>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Qrup' : 'Target Group'}</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Mövzu Başlığı' : 'Assignment Title'}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SAT Math Section 4 or IELTS Essay #3"
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'İzahat və Tapşırıq Mətni' : 'Instructions'}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Details about the assignment..."
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <Button type="submit" loading={submitting} className="w-full py-2.5 font-bold text-xs">
            <span>{locale === 'az' ? 'Təsdiqlə və Göndər' : 'Publish Assignment'}</span>
          </Button>
        </form>
      </Modal>

      {/* Modal: Grade Submission */}
      <Modal isOpen={!!selectedSub} onClose={() => setSelectedSub(null)} title={locale === 'az' ? 'Tələbə İşini Qiymətləndir' : 'Grade Submission'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Toplanan Bal (0-100)' : 'Score'}</label>
            <input
              type="number"
              value={gradeScore}
              onChange={(e) => setGradeScore(Number(e.target.value))}
              max={100}
              min={0}
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Müəllim Rəyi' : 'Teacher Feedback'}</label>
            <textarea
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={3}
              placeholder="Feedback notes..."
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <Button onClick={handleSaveGrade} className="w-full py-2.5 font-bold text-xs">
            <span>{locale === 'az' ? 'Balı Saxla' : 'Save Grade'}</span>
          </Button>
        </div>
      </Modal>
    </PortalLayout>
  );
}

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
import { BookOpen, Send, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentHomeworkPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [stu, asList] = await Promise.all([
      realDbService.getStudentDashboard(profile?.studentId),
      realDbService.getAssignments()
    ]);

    setAssignments(asList);

    if (stu?.id) {
      const subs = await realDbService.getAssignmentSubmissions(undefined, stu.id);
      setSubmissions(subs);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionText || !selectedAssignment) return;

    setSubmitting(true);
    const stu = await realDbService.getStudentDashboard(profile?.studentId);
    if (!stu?.id) {
      toast.error('Student profile not found');
      setSubmitting(false);
      return;
    }

    const res = await realDbService.submitHomework({
      assignment_id: selectedAssignment.id,
      student_id: stu.id,
      content: solutionText
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(locale === 'az' ? 'Tapşırıq uğurla göndərildi!' : 'Homework submitted successfully!');
      setSelectedAssignment(null);
      setSolutionText('');
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
                {locale === 'az' ? 'Ev Tapşırıqlarım' : 'My Course Assignments'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Müəllimlər tərəfindən təyin olunmuş real tapşırıqlar və cavablarınız' : 'Assignments given by faculty and your submission statuses'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-slate-600" />
              <span>{locale === 'az' ? 'Aktiv tapşırıq yoxdur' : 'No active homework assigned yet'}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((as) => {
                const sub = submissions.find(s => s.assignment_id === as.id);
                return (
                  <div key={as.id} className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{as.title}</h4>
                        <Badge variant="teal">{as.groups?.name || 'General'}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">{as.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub ? (
                        <div className="text-right">
                          <Badge variant={sub.status === 'GRADED' ? 'green' : 'teal'}>
                            {sub.status === 'GRADED' ? `Bal: ${sub.score}/${as.max_score}` : 'Göndərilib'}
                          </Badge>
                          {sub.feedback && <p className="text-[11px] text-emerald-400 mt-1">{sub.feedback}</p>}
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setSelectedAssignment(as)}>
                          <Send className="w-3.5 h-3.5 mr-1" />
                          <span>{locale === 'az' ? 'Cavabı Göndər' : 'Submit'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title={locale === 'az' ? 'Tapşırıq Cavabını Göndər' : 'Submit Solution'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-400 font-medium">
            <strong>{selectedAssignment?.title}</strong> ({selectedAssignment?.groups?.name})
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Cavabınız / Həll Mətni' : 'Your Answer / Solution'}</label>
            <textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              rows={5}
              placeholder="Write your answer or link to homework solution..."
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <Button type="submit" loading={submitting} className="w-full py-2.5 font-bold text-xs">
            <span>{locale === 'az' ? 'Təsdiqlə və Göndər' : 'Submit Homework'}</span>
          </Button>
        </form>
      </Modal>
    </PortalLayout>
  );
}

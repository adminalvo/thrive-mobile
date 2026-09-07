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
import { Bell, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const { profile, role } = useAuth();
  const { t, locale } = useLanguage();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await realDbService.getAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error(locale === 'az' ? 'Bütün xanaları doldurun' : 'All fields required');
      return;
    }

    setSubmitting(true);
    const res = await realDbService.postAnnouncement(title, message);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(locale === 'az' ? 'Elan dərc olundu!' : 'Announcement posted!');
      setIsCreating(false);
      setTitle('');
      setMessage('');
      loadAnnouncements();
    }
  };

  return (
    <PortalLayout title={t('nav.announcements')}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {locale === 'az' ? 'Mərkəz Elanları və Bildirişlər' : 'Center Announcements & Updates'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Tədris mərkəzinin rəsmi yenilikləri və imtahan tarixləri' : 'Official center announcements, schedules, and important notices'}
              </p>
            </div>
            {role === 'teacher' && (
              <Button size="sm" onClick={() => setIsCreating(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>{locale === 'az' ? 'Yeni Elan Dərc Et' : 'Post Announcement'}</span>
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-slate-600" />
              <span>{locale === 'az' ? 'Hələlik heç bir elan dərc edilməyib' : 'No active announcements at the moment'}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#5ce1e6]" />
                      <span>{a.title}</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title={locale === 'az' ? 'Yeni Elan Dərc Et' : 'Post Announcement'}>
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Başlıq' : 'Title'}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mock Exam Registration Open"
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{locale === 'az' ? 'Mətn' : 'Message'}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Announcement details..."
              className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <Button type="submit" loading={submitting} className="w-full py-2.5 font-bold text-xs">
            <span>{locale === 'az' ? 'Dərc Et' : 'Publish'}</span>
          </Button>
        </form>
      </Modal>
    </PortalLayout>
  );
}

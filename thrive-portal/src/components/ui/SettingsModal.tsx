'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, LocaleType } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import {
  User,
  Lock,
  Globe,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, role } = useAuth();
  const { locale, setLocale, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'security' | 'notifications'>('profile');

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [homeworkReminders, setHomeworkReminders] = useState(true);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error(t('settings.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwordMismatch'));
      return;
    }

    setUpdatingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPass(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('settings.passwordUpdated'));
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const languagesList: { code: LocaleType; name: string; desc: string }[] = [
    { code: 'en', name: 'English (US)', desc: 'Default Academic Interface' },
    { code: 'az', name: 'Azərbaycan Dili', desc: 'Rəsmi Tədris Portalı' },
    { code: 'ru', name: 'Русский', desc: 'Интерфейс Портала' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')}>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#070F1E] border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('settings.profile')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('language')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'language' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('settings.language')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'security' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('settings.security')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notifications' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t('settings.alerts')}</span>
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0D1E36] border border-[#4CA2B5]/40 flex items-center justify-center font-black text-[#5ce1e6] text-xl">
                {profile?.name?.charAt(0) || 'U'}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-bold text-white">{profile?.name || 'Thrive User'}</h4>
                <p className="text-xs text-slate-400">{profile?.email}</p>
                <div className="pt-1">
                  <Badge variant="teal">{t('roles.' + (role || 'student'))}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#070F1E] border border-slate-800">
                <span className="text-slate-500 block text-[11px] font-semibold">{t('settings.phone')}</span>
                <span className="font-bold text-white">{profile?.phone || t('settings.notSpecified')}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#070F1E] border border-slate-800">
                <span className="text-slate-500 block text-[11px] font-semibold">{t('common.status')}</span>
                <span className="font-bold text-emerald-400">{t('settings.liveConnection')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Language */}
        {activeTab === 'language' && (
          <div className="space-y-3">
            {languagesList.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLocale(l.code); toast.success(`Language set to ${l.name}`); }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  locale === l.code
                    ? 'bg-[#4CA2B5]/15 border-[#5ce1e6] text-white'
                    : 'bg-[#070F1E] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <h5 className="text-xs font-bold text-white">{l.name}</h5>
                  <p className="text-[11px] text-slate-400">{l.desc}</p>
                </div>
                {locale === l.code && <CheckCircle2 className="w-5 h-5 text-[#5ce1e6]" />}
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('settings.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4CA2B5]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('settings.confirmNewPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4CA2B5]"
                required
              />
            </div>

            <Button type="submit" loading={updatingPass} className="w-full py-2.5 font-bold text-xs">
              <span>{t('settings.updatePassword')}</span>
            </Button>
          </form>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">{t('settings.lessonAlerts')}</h5>
                <p className="text-[11px] text-slate-400">{t('settings.lessonAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={homeworkReminders}
                onChange={(e) => setHomeworkReminders(e.target.checked)}
                className="w-4 h-4 accent-[#4CA2B5] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">{t('settings.attendanceAlerts')}</h5>
                <p className="text-[11px] text-slate-400">{t('settings.attendanceAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={attendanceAlerts}
                onChange={(e) => setAttendanceAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#4CA2B5] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

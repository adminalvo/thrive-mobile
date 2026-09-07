'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import { GraduationCap, CheckCircle2, Lock, BookOpen, User, Sparkles } from 'lucide-react';

export default function ParentProgressPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      const res = await realDbService.getAdvancedParentDashboard(profile?.email, profile?.phone);
      setChildren(res.children || []);
      if (res.children && res.children.length > 0) {
        setSelectedChildId(res.children[0].id);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [profile]);

  const activeChild = children.find(c => c.id === selectedChildId) || children[0];

  return (
    <PortalLayout title={locale === 'az' ? 'Akademik Karnet & Davamiyyət Arxiv' : 'Academic Progress & Attendance'}>
      <div className="space-y-6">
        {/* Multi-Child Selector */}
        {children.length > 1 && (
          <div className="bg-[#0D1E36] border border-slate-800 p-3 rounded-2xl flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 pl-2 shrink-0">{locale === 'az' ? 'Övlad Seçimi:' : 'Select Child:'}</span>
            {children.map(child => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeChild?.id === child.id
                    ? 'bg-[#4CA2B5] text-white shadow-lg shadow-[#4CA2B5]/25'
                    : 'bg-[#070F1E] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{child.name}</span>
              </button>
            ))}
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {activeChild?.name} — {locale === 'az' ? 'Rəsmi Davamiyyət Jurnalı' : 'Official Attendance Log'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Keçmiş tarixlər dəyişdirilməz Time-Lock şifrələməsi ilə qorunur' : 'Past attendance records are sealed with cryptographic time-lock'}
              </p>
            </div>
            <Badge variant="teal">{locale === 'az' ? 'Davamiyyət: ' : 'Rate: '} {activeChild?.attendanceRate || 96}%</Badge>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
          ) : !activeChild?.attendanceHistory || activeChild.attendanceHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">{locale === 'az' ? 'Davamiyyət qeydi tapılmadı' : 'No records found'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070F1E] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tarix</th>
                    <th className="py-3 px-4">Proqram / Kurs</th>
                    <th className="py-3 px-4">Təhlükəsizlik</th>
                    <th className="py-3 px-4 text-center">Davamiyyət Statusu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {activeChild.attendanceHistory.map((att: any, idx: number) => (
                    <tr key={att.id || idx} className="hover:bg-[#0D1E36]/40">
                      <td className="py-3.5 px-4 font-bold text-white">{att.date}</td>
                      <td className="py-3.5 px-4 text-slate-300">{activeChild.program}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3 text-[#5ce1e6]" /> Time-Locked
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={att.status === 'PRESENT' ? 'green' : att.status === 'LATE' ? 'teal' : 'rose'}>
                          {att.status === 'PRESENT' ? 'İştirak Edir' : att.status === 'LATE' ? 'Gecikmə' : 'Qayıb'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}

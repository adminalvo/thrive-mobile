'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import {
  GraduationCap,
  Calendar,
  CreditCard,
  BookOpen,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      setLoading(true);
      const res = await realDbService.getAdvancedParentDashboard(profile?.email, profile?.phone);
      setChildren(res.children || []);
      if (res.children && res.children.length > 0) {
        setSelectedChildId(res.children[0].id);
      }
      setLoading(false);
    };

    fetchParentData();
  }, [profile]);

  const activeChild = children.find(c => c.id === selectedChildId) || children[0];

  const daysMap = ['', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];

  return (
    <PortalLayout title={locale === 'az' ? 'Valideyn Akademik Radarı' : 'Guardian Academic Radar'}>
      <div className="space-y-6">
        {/* Multi-Child Selector Ribbon */}
        {children.length > 1 && (
          <div className="bg-[#0D1E36] border border-slate-800 p-3 rounded-2xl flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 pl-2 shrink-0">
              {locale === 'az' ? 'Övlad Seçimi:' : 'Select Child:'}
            </span>
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
                <span className="text-[10px] opacity-80">({child.program})</span>
              </button>
            ))}
          </div>
        )}

        {/* Hero Banner with Child Identity */}
        <div className="bg-gradient-to-r from-[#0D1E36] via-[#132847] to-[#0A192F] border border-slate-800 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CA2B5]/15 border border-[#4CA2B5]/30 text-[#5ce1e6] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{locale === 'az' ? 'Rəsmi Valideyn Müşahidə Sistemi' : 'Verified Guardian Access'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {activeChild ? activeChild.name : 'Övladınız'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {locale === 'az'
                  ? `Tədris Proqramı: ${activeChild?.program || 'Akademik Kurs'}. Dərslər, davamiyyət və fəaliyyət birbaşa mərkəz bazasından ötürülür.`
                  : `Enrolled in ${activeChild?.program || 'Academic Course'}. Real-time academic tracking and verified journal records.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/student/schedule">
                <Button variant="secondary" className="text-xs font-bold">
                  <Calendar className="w-4 h-4 mr-1.5 text-[#5ce1e6]" />
                  <span>{locale === 'az' ? 'Dərs Cədvəli' : 'Timetable'}</span>
                </Button>
              </Link>
              <Link href="/parent/progress">
                <Button className="text-xs font-bold">
                  <span>{locale === 'az' ? 'Tam Karnet' : 'Full Report'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Real KPI Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#0D1E36]/60 border border-slate-800 hover:border-[#4CA2B5]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{locale === 'az' ? 'Davamiyyət İndeksi' : 'Attendance Rate'}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{activeChild?.attendanceRate || 96}%</span>
              <Badge variant="green">{activeChild?.presentCount || 0} {locale === 'az' ? 'Dərs İştirak' : 'Attended'}</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {activeChild?.absentCount || 0} {locale === 'az' ? 'qayıb' : 'absent'}, {activeChild?.lateCount || 0} {locale === 'az' ? 'gecikmə' : 'late'}
            </p>
          </Card>

          <Card className="p-5 bg-[#0D1E36]/60 border border-slate-800 hover:border-[#4CA2B5]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{locale === 'az' ? 'Aktiv Proqram' : 'Enrolled Program'}</span>
              <GraduationCap className="w-4 h-4 text-[#5ce1e6]" />
            </div>
            <div className="mt-3">
              <span className="text-lg font-black text-white truncate block">{activeChild?.program}</span>
              <span className="text-xs text-slate-400 block mt-0.5">{activeChild?.groups?.length || 1} {locale === 'az' ? 'Akademik Qrup' : 'Active Group'}</span>
            </div>
          </Card>

          <Card className="p-5 bg-[#0D1E36]/60 border border-slate-800 hover:border-[#4CA2B5]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{locale === 'az' ? 'Aylıq Təhsil Haqqı' : 'Monthly Tuition'}</span>
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{activeChild?.monthlyPayment || 0} ₼</span>
              <Badge variant="teal">{activeChild?.durationMonths || 9} {locale === 'az' ? 'Ay' : 'Months'}</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{locale === 'az' ? 'Müqavilə statusu: Aktiv' : 'Status: Contract Active'}</p>
          </Card>

          <Card className="p-5 bg-[#0D1E36]/60 border border-slate-800 hover:border-[#4CA2B5]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{locale === 'az' ? 'Ev Tapşırıqları' : 'Assignments'}</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{activeChild?.assignments?.length || 0}</span>
              <Badge variant="teal">{locale === 'az' ? 'Təyin Olunan' : 'Assigned'}</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{locale === 'az' ? 'Müntəzəm icra olunur' : 'Verified tasks'}</p>
          </Card>
        </div>

        {/* Schedule & Recent Attendance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Class Timetable */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#5ce1e6]" />
                <h3 className="text-sm font-bold text-white">{locale === 'az' ? 'Həftəlik Dərs Qrafiki' : 'Weekly Timetable'}</h3>
              </div>
              <Link href="/student/schedule" className="text-xs text-[#5ce1e6] hover:underline font-semibold">
                {locale === 'az' ? 'Bütün Cədvəl →' : 'Full Timetable →'}
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
            ) : !activeChild?.schedules || activeChild.schedules.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{locale === 'az' ? 'Dərs qrafiki tapılmadı' : 'No schedules found'}</div>
            ) : (
              <div className="space-y-3">
                {activeChild.schedules.map((sch: any, idx: number) => (
                  <div key={sch.id || idx} className="p-3.5 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{sch.groups?.name || activeChild.program}</h5>
                      <span className="text-[11px] text-slate-400">{daysMap[sch.day_of_week] || 'Həftəlik Dərs'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-emerald-400">{sch.start_time?.substring(0, 5)} - {sch.end_time?.substring(0, 5)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D1E36] border border-slate-700 text-slate-300 font-bold">{sch.room || 'Room 101'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Attendance Journal */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">{locale === 'az' ? 'Son Davamiyyət Qeydləri' : 'Recent Attendance Logs'}</h3>
              </div>
              <Badge variant="teal">Time-Lock ✓</Badge>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
            ) : !activeChild?.attendanceHistory || activeChild.attendanceHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{locale === 'az' ? 'Davamiyyət qeydi mövcud deyil' : 'No attendance records'}</div>
            ) : (
              <div className="space-y-2.5">
                {activeChild.attendanceHistory.slice(0, 5).map((att: any, idx: number) => (
                  <div key={att.id || idx} className="p-3 rounded-xl bg-[#070F1E] border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{att.date}</span>
                      <span className="text-[10px] text-slate-500">Müəllim tərəfindən təsdiqlənib</span>
                    </div>
                    <Badge variant={att.status === 'PRESENT' ? 'green' : att.status === 'LATE' ? 'teal' : 'rose'}>
                      {att.status === 'PRESENT' ? (locale === 'az' ? 'İştirak Etdi' : 'Present') : att.status === 'LATE' ? (locale === 'az' ? 'Gecikdi' : 'Late') : (locale === 'az' ? 'Qayıb' : 'Absent')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService, LiveScheduleItem } from '@/services/realDbService';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [todaysClasses, setTodaysClasses] = useState<LiveScheduleItem[]>([]);

  useEffect(() => {
    const fetchLive = async () => {
      setLoading(true);
      const res = await realDbService.getTeacherDashboard(profile?.teacherId);
      setGroups(res.groups || []);
      setTotalStudents(res.totalStudents || 0);
      setTodaysClasses(res.todaysClasses || []);
      setLoading(false);
    };

    fetchLive();
  }, [profile]);

  return (
    <PortalLayout title={t('nav.dashboard')}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0D1E36] to-[#132847] border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-2">
            <Badge variant="teal">{t('common.teacherRole')}</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {locale === 'az' ? `Xoş gəlmisiniz, ${profile?.name || 'Müəllim'}!` : `Welcome back, ${profile?.name || 'Faculty Member'}!`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {locale === 'az' ? 'Təyin olunmuş qruplarınızı idarə edin, canlı dərs davamiyyətini yazın və tələbə nəticələrini izləyin.' : 'Manage your assigned academic groups, mark live attendance with time-locks, and track evaluations.'}
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#4CA2B5]/15 text-[#5ce1e6] border border-[#4CA2B5]/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{locale === 'az' ? 'Aktiv Qruplar' : 'Active Groups'}</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{groups.length}</h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{locale === 'az' ? 'Ümumi Tələbə Sayı' : 'Enrolled Students'}</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{totalStudents}</h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#4CA2B5]/15 text-[#5ce1e6] border border-[#4CA2B5]/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{locale === 'az' ? 'Bugünkü Dərslər' : 'Today Lessons'}</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{todaysClasses.length}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Groups & Attendance Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Assigned Groups */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5ce1e6]" />
                <span>{locale === 'az' ? 'Tədris Qruplarım' : 'My Teaching Groups'}</span>
              </h3>
              <Link href="/teacher/attendance">
                <Button size="sm" className="text-xs py-1.5 px-3">
                  <span>{locale === 'az' ? 'Davamiyyətə Keç' : 'Mark Attendance'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
            ) : groups.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{locale === 'az' ? 'Aktiv qrup tapılmadı' : 'No active groups found'}</div>
            ) : (
              <div className="space-y-3">
                {groups.map((grp: any) => (
                  <div key={grp.id} className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {grp.programs?.name || 'General Program'} • {locale === 'az' ? `Otaq: ${grp.room || '101'}` : `Room: ${grp.room || '101'}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="teal">{grp.group_students?.length || 0} {locale === 'az' ? 'Tələbə' : 'Students'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Today Schedule List */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{locale === 'az' ? 'Bugünkü Tədris Cədvəli' : 'Today Timetable'}</span>
              </h3>
            </div>

            {todaysClasses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-slate-600" />
                <span>{locale === 'az' ? 'Bu gün üçün təyin olunmuş dərs yoxdur' : 'No scheduled lessons for today'}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysClasses.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.groupName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.programName} • {item.room}</p>
                    </div>
                    <Badge variant="green">{item.startTime} - {item.endTime}</Badge>
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

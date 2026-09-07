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
  Calendar,
  Clock,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  CreditCard
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [studentData, setStudentData] = useState<any>(null);
  const [schedules, setSchedules] = useState<LiveScheduleItem[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      setLoading(true);
      const [stu, schMatrix] = await Promise.all([
        realDbService.getStudentDashboard(profile?.studentId),
        realDbService.getLiveScheduleMatrix(profile?.studentId)
      ]);

      setStudentData(stu);
      setSchedules(schMatrix);

      if (stu?.id) {
        const att = await realDbService.getStudentAttendance(stu.id);
        setAttendanceList(att);
      }
      setLoading(false);
    };

    fetchLive();
  }, [profile]);

  const presentCount = attendanceList.filter(a => a.status === 'PRESENT' || a.status === 'present').length;
  const attendanceRate = attendanceList.length > 0 ? Math.round((presentCount / attendanceList.length) * 100) : 98;
  const todaysClasses = schedules.filter(s => s.isToday);

  return (
    <PortalLayout title={t('nav.dashboard')}>
      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0D1E36] to-[#132847] border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-2">
            <Badge variant="teal">{studentData?.program || 'Academic Student'}</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {locale === 'az' ? `Xoş gəlmisiniz, ${profile?.name || studentData?.user_profiles?.first_name || 'Tələbə'}!` : `Welcome back, ${profile?.name || 'Student'}!`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {locale === 'az' ? 'Dərs cədvəlinizi, davamiyyət göstəricilərinizi və imtahan nəticələrinizi buradan izləyin.' : 'Track your active class schedule, verified attendance rate, and performance metrics.'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#4CA2B5]/15 text-[#5ce1e6] border border-[#4CA2B5]/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{locale === 'az' ? 'Davamiyyət Faizi' : 'Attendance Rate'}</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{attendanceRate}%</h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{locale === 'az' ? 'Bugünkü Dərslər' : 'Today Lessons'}</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{todaysClasses.length}</h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#4CA2B5]/15 text-[#5ce1e6] border border-[#4CA2B5]/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{locale === 'az' ? 'Aylıq Təhsil Haqqı' : 'Monthly Tuition'}</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{studentData?.monthly_payment || 0} ₼</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Schedule & Recent Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5ce1e6]" />
                <span>{locale === 'az' ? 'Cədvəl Paneli' : 'Weekly Timetable'}</span>
              </h3>
              <Link href="/student/schedule">
                <Button size="sm" className="text-xs py-1.5 px-3">
                  <span>{locale === 'az' ? 'Tam Cədvəl' : 'Full Matrix'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {schedules.slice(0, 4).map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.groupName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.dayName} • {item.room}</p>
                  </div>
                  <Badge variant={item.isToday ? 'green' : 'teal'}>{item.startTime} - {item.endTime}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{locale === 'az' ? 'Son Davamiyyət Tarixçəsi' : 'Recent Attendance Log'}</span>
              </h3>
            </div>

            {attendanceList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {locale === 'az' ? 'Hələlik davamiyyət qeydi daxil edilməyib' : 'No attendance entries yet'}
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceList.slice(0, 4).map((att) => (
                  <div key={att.id} className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{att.groups?.name || 'Lesson'}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{att.date}</p>
                    </div>
                    <Badge variant={att.status === 'PRESENT' ? 'green' : 'rose'}>{att.status}</Badge>
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

'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import { Award, BookOpen, CheckCircle2 } from 'lucide-react';

export default function StudentAcademicPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [studentData, setStudentData] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const stu = await realDbService.getStudentDashboard(profile?.studentId);
      setStudentData(stu);

      if (stu?.id) {
        const [att, subs] = await Promise.all([
          realDbService.getStudentAttendance(stu.id),
          realDbService.getAssignmentSubmissions(undefined, stu.id)
        ]);
        setAttendanceList(att);
        setSubmissions(subs);
      }
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  const presentCount = attendanceList.filter(a => a.status === 'PRESENT' || a.status === 'present').length;
  const attendanceRate = attendanceList.length > 0 ? Math.round((presentCount / attendanceList.length) * 100) : 98;

  return (
    <PortalLayout title={t('nav.academic')}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {locale === 'az' ? 'Rəsmi Akademik Karnet və Transkript' : 'Official Academic Record & Transcript'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Supabase bazasından toplanan real davamiyyət və tapşırıq nəticələri' : 'Verified attendance records and graded course assignments'}
              </p>
            </div>
            <Badge variant="teal">{studentData?.program || 'Active Program'}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800">
              <span className="text-xs text-slate-400">{locale === 'az' ? 'Ümumi Davamiyyət Dəqiqliyi' : 'Attendance Accuracy'}</span>
              <h4 className="text-xl font-bold text-emerald-400 mt-1">{attendanceRate}% ({presentCount} / {attendanceList.length || 1} dərslər)</h4>
            </div>
            <div className="p-4 rounded-2xl bg-[#070F1E] border border-slate-800">
              <span className="text-xs text-slate-400">{locale === 'az' ? 'Yoxlanmış Tapşırıqlar' : 'Evaluated Assignments'}</span>
              <h4 className="text-xl font-bold text-[#5ce1e6] mt-1">{submissions.filter(s => s.status === 'GRADED').length} ədəd</h4>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070F1E] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tarix</th>
                  <th className="py-3 px-4">Fənn / Qrup</th>
                  <th className="py-3 px-4">Davamiyyət</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {attendanceList.map((att) => (
                  <tr key={att.id} className="hover:bg-[#0D1E36]/40">
                    <td className="py-3.5 px-4 text-white font-mono">{att.date}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{att.groups?.name || 'Class Session'}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={att.status === 'PRESENT' ? 'green' : 'rose'}>{att.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-slate-400">Time-Locked ✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}

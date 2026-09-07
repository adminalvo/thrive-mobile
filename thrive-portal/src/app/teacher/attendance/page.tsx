'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Lock,
  Calendar
} from 'lucide-react';

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isPastDate = selectedDate < todayStr;

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const res = await realDbService.getTeacherDashboard(profile?.teacherId);
      setGroups(res.groups || []);
      if (res.groups && res.groups.length > 0) {
        setSelectedGroupId(res.groups[0].id);
      }
      setLoading(false);
    };

    fetchGroups();
  }, [profile]);

  useEffect(() => {
    if (!selectedGroupId) return;
    const grp = groups.find(g => g.id === selectedGroupId);
    if (grp && grp.group_students) {
      // Deduplicate students by ID
      const rawList = grp.group_students.map((gs: any) => ({
        id: gs.student_id || gs.students?.id,
        enrollmentId: gs.id,
        name: gs.students?.user_profiles ? `${gs.students.user_profiles.first_name || ''} ${gs.students.user_profiles.last_name || ''}`.trim() : 'Enrolled Student',
        email: gs.students?.user_profiles?.email || '',
        phone: gs.students?.user_profiles?.phone || ''
      }));

      const uniqueMap = new Map();
      rawList.forEach((item: any) => {
        if (item.id && !uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      const uniqueList = Array.from(uniqueMap.values());

      setStudents(uniqueList);

      const initialMap: Record<string, string> = {};
      uniqueList.forEach((s: any) => {
        initialMap[s.id] = 'PRESENT';
      });
      setAttendanceMap(initialMap);
    }
  }, [selectedGroupId, groups]);

  const handleStatusChange = (studentId: string, status: string) => {
    if (isPastDate) {
      toast.error('Time-Lock: Cannot modify past attendance records.');
      return;
    }
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAll = async () => {
    if (isPastDate) {
      toast.error('Time-Lock: Cannot save changes to past dates.');
      return;
    }

    setSaving(true);
    let successCount = 0;

    for (const s of students) {
      const status = attendanceMap[s.id] || 'PRESENT';
      const res = await realDbService.markAttendance(selectedGroupId, s.id, status, selectedDate);
      if (res.success) successCount++;
    }

    setSaving(false);
    toast.success(`${successCount} ${locale === 'az' ? 'tələbənin davamiyyəti qeydə alındı' : 'records updated successfully'}`);
  };

  return (
    <PortalLayout title={t('nav.attendance')}>
      <div className="space-y-6">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {locale === 'az' ? 'Qrup Seçin' : 'Select Group'}
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4CA2B5]"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.programs?.name || 'General'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {locale === 'az' ? 'Tarix' : 'Attendance Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#070F1E] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4CA2B5]"
                />
              </div>
            </div>

            <div>
              <Button
                onClick={handleSaveAll}
                loading={saving}
                disabled={isPastDate}
                className="w-full py-2.5 text-xs font-bold shadow-lg shadow-[#4CA2B5]/20"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>{locale === 'az' ? 'Davamiyyəti Təsdiqlə' : 'Save Attendance'}</span>
              </Button>
            </div>
          </div>

          {isPastDate && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-400">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{locale === 'az' ? 'Keçmiş tarixin davamiyyət qeydləri təhlükəsizlik kilidi ilə qorunur.' : 'Time-Lock: Past attendance records are read-only.'}</span>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <h3 className="text-sm font-bold text-white">
              {locale === 'az' ? 'Tələbə Siyahısı' : 'Student Roster'} ({students.length})
            </h3>
            <Badge variant="teal">{selectedDate}</Badge>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">{t('common.loading')}</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">{locale === 'az' ? 'Bu qrupda qeydiyyatda olan tələbə yoxdur' : 'No students enrolled in this group'}</div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {students.map((st, sIdx) => {
                const currentStatus = attendanceMap[st.id] || 'PRESENT';
                return (
                  <div key={`att-st-${st.id}-${sIdx}`} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{st.name}</h4>
                      <p className="text-xs text-slate-400">{st.email || st.phone || 'ID: ' + (st.id ? st.id.substring(0, 8) : sIdx)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'PRESENT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-[#070F1E] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {locale === 'az' ? 'İştirak Edir' : 'Present'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'ABSENT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                            : 'bg-[#070F1E] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {locale === 'az' ? 'Qayıb' : 'Absent'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, 'LATE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'LATE'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'bg-[#070F1E] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {locale === 'az' ? 'Gecikmə' : 'Late'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}

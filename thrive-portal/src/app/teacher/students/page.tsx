'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import { BookOpen, Mail, Phone } from 'lucide-react';

export default function TeacherStudentsPage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const res = await realDbService.getTeacherDashboard(profile?.teacherId);
      setGroups(res.groups || []);
      setLoading(false);
    };

    fetchStudents();
  }, [profile]);

  return (
    <PortalLayout title={t('nav.students')}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {locale === 'az' ? 'Qrup Tələbələri Siyahısı' : 'Enrolled Students Roster'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Tədris etdiyiniz canlı qruplar və qeydiyyatdakı tələbə profilləri' : 'Live active academic groups and enrolled student profiles'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {locale === 'az' ? 'Təyin olunmuş qrup tapılmadı' : 'No active groups assigned'}
            </div>
          ) : (
            <div className="space-y-8">
              {groups.map((grp: any) => {
                const studentList = grp.group_students || [];
                return (
                  <div key={grp.id} className="space-y-4">
                    <div className="flex items-center justify-between bg-[#070F1E] px-5 py-3 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#5ce1e6]" />
                        <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                        <span className="text-xs text-slate-400">({grp.programs?.name || 'General Course'})</span>
                      </div>
                      <Badge variant="teal">{studentList.length} {locale === 'az' ? 'Tələbə' : 'Students'}</Badge>
                    </div>

                    {studentList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic pl-2">
                        {locale === 'az' ? 'Bu qrupda hələlik tələbə qeydiyyatda deyil' : 'No students enrolled in this group'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentList.map((gs: any, gsIdx: number) => {
                          const prof = gs.students?.user_profiles;
                          const name = prof ? `${prof.first_name || ''} ${prof.last_name || ''}`.trim() : 'Academic Student';
                          const email = prof?.email || 'N/A';
                          const phone = prof?.phone || 'N/A';

                          return (
                            <div
                              key={`grp-${grp.id}-st-${gs.id || gs.student_id}-${gsIdx}`}
                              className="bg-[#0D1E36]/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-[#4CA2B5]/40 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#070F1E] border border-[#4CA2B5]/30 flex items-center justify-center font-bold text-[#5ce1e6] text-sm">
                                  {name.charAt(0)}
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-white">{name}</h5>
                                  <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                                    <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#5ce1e6]" /> {email}</p>
                                    <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {phone}</p>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="green">Active</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

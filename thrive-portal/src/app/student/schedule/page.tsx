'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService, LiveScheduleItem } from '@/services/realDbService';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Filter,
  ChevronDown,
  List,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

export default function CRMSchedulePage() {
  const { t, locale } = useLanguage();

  const [schedules, setSchedules] = useState<LiveScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'week' | 'day' | 'list'>('week');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeClass, setActiveClass] = useState<LiveScheduleItem | null>(null);

  const daysList = [1, 2, 3, 4, 5, 6, 7].map(num => ({
    num,
    name: t(`days.${num}.name`),
    short: t(`days.${num}.short`)
  }));

  useEffect(() => {
    const fetchMatrix = async () => {
      setLoading(true);
      const data = await realDbService.getLiveScheduleMatrix();
      setSchedules(data);
      setLoading(false);
    };

    fetchMatrix();
  }, []);

  const programs = Array.from(new Set(schedules.map(s => s.programName).filter(Boolean)));
  const rooms = Array.from(new Set(schedules.map(s => s.room).filter(Boolean)));

  const filteredSchedules = schedules.filter(s => {
    if (selectedProgram !== 'all' && s.programName !== selectedProgram) return false;
    if (selectedRoom !== 'all' && s.room !== selectedRoom) return false;
    return true;
  });

  const getDaySchedules = (dayNum: number) => {
    return filteredSchedules
      .filter(s => s.dayOfWeek === dayNum)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();

  return (
    <PortalLayout title={t('nav.schedule')}>
      <div className="space-y-6">
        {/* CRM Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('schedule.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t('schedule.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0D1E36] border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-xs text-white shadow-sm">
              <CalendarIcon className="w-4 h-4 text-[#5ce1e6]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* CRM Filters & View Mode Toggles */}
        <div className="bg-[#0D1E36]/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Filter className="w-4 h-4 text-[#5ce1e6]" />
              <span>{t('common.filter')}:</span>
            </div>

            <div className="relative">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="bg-[#070F1E] border border-slate-700 text-xs font-bold text-white rounded-xl pl-3 pr-8 py-2 appearance-none focus:outline-none focus:border-[#4CA2B5]"
              >
                <option value="all">{t('schedule.allPrograms')}</option>
                {programs.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="bg-[#070F1E] border border-slate-700 text-xs font-bold text-white rounded-xl pl-3 pr-8 py-2 appearance-none focus:outline-none focus:border-[#4CA2B5]"
              >
                <option value="all">{t('schedule.allRooms')}</option>
                {rooms.map(r => (
                  <option key={r} value={r}>{t('common.room')}: {r}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center bg-[#070F1E] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setView('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                view === 'week' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>{t('schedule.week')}</span>
            </button>

            <button
              onClick={() => setView('day')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                view === 'day' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{t('schedule.day')}</span>
            </button>

            <button
              onClick={() => setView('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                view === 'list' ? 'bg-[#4CA2B5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('schedule.list')}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4CA2B5] border-t-transparent rounded-full animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        ) : (
          <>
            {/* 1. WEEK VIEW */}
            {view === 'week' && (
              <div className="bg-[#0D1E36]/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 border-b border-slate-800 bg-[#070F1E]">
                  {daysList.map(d => {
                    const isToday = d.num === currentDayOfWeek;
                    const count = getDaySchedules(d.num).length;
                    return (
                      <div
                        key={d.num}
                        className={`p-4 text-center border-r border-slate-800/80 last:border-r-0 ${
                          isToday ? 'bg-[#4CA2B5]/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`text-xs font-black ${isToday ? 'text-[#5ce1e6]' : 'text-white'}`}>
                            {d.name}
                          </span>
                          {isToday && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {count} {t('schedule.classes')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 min-h-[500px] divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
                  {daysList.map(d => {
                    const dayList = getDaySchedules(d.num);
                    const isToday = d.num === currentDayOfWeek;
                    return (
                      <div
                        key={d.num}
                        className={`p-3 space-y-3 ${isToday ? 'bg-[#070F1E]/40' : 'bg-transparent'}`}
                      >
                        {dayList.length === 0 ? (
                          <div className="h-full min-h-[120px] flex items-center justify-center text-[11px] text-slate-600 italic">
                            {t('schedule.noClasses')}
                          </div>
                        ) : (
                          dayList.map((item, idx) => (
                            <div
                              key={`week-${item.id}-${idx}`}
                              onClick={() => setActiveClass(item)}
                              className="p-3.5 rounded-2xl bg-[#070F1E] border border-slate-800 hover:border-[#4CA2B5]/60 transition-all cursor-pointer shadow-md group relative hover:scale-[1.02]"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-white group-hover:text-[#5ce1e6] transition-colors truncate">
                                    {item.groupName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>{item.startTime} - {item.endTime}</span>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
                                  <span className="truncate max-w-[85px]">{item.programName}</span>
                                  <span className="font-bold text-white px-1.5 py-0.5 rounded bg-[#0D1E36] border border-slate-700/60 shrink-0">
                                    {item.room}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. DAY VIEW */}
            {view === 'day' && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="p-4 rounded-2xl bg-[#0D1E36] border border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#5ce1e6]" />
                    <span>{t(`days.${currentDayOfWeek}.name`)} ({t('schedule.todayClasses')})</span>
                  </h3>
                  <Badge variant="green">{getDaySchedules(currentDayOfWeek).length} {t('schedule.classes')}</Badge>
                </div>

                <div className="space-y-3">
                  {getDaySchedules(currentDayOfWeek).map((item, idx) => (
                    <div
                      key={`day-${item.id}-${idx}`}
                      onClick={() => setActiveClass(item)}
                      className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800 hover:border-[#4CA2B5]/50 flex items-center justify-between transition-all cursor-pointer shadow-lg"
                    >
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">{item.groupName}</h4>
                        <p className="text-xs text-slate-400">{item.programName} • {t('common.room')}: {item.room}</p>
                      </div>
                      <Badge variant="green" className="text-xs px-3 py-1 font-mono">
                        {item.startTime} - {item.endTime}
                      </Badge>
                    </div>
                  ))}
                  {getDaySchedules(currentDayOfWeek).length === 0 && (
                    <div className="py-16 text-center text-xs text-slate-400">
                      {t('schedule.noClasses')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. LIST VIEW */}
            {view === 'list' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#070F1E] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">{t('common.date')}</th>
                        <th className="py-3.5 px-4">{t('common.time')}</th>
                        <th className="py-3.5 px-4">{t('grading.group')}</th>
                        <th className="py-3.5 px-4">{t('grading.program')}</th>
                        <th className="py-3.5 px-4">{t('common.room')}</th>
                        <th className="py-3.5 px-4 text-center">{t('common.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredSchedules.map((item, idx) => (
                        <tr
                          key={`list-${item.id}-${idx}`}
                          onClick={() => setActiveClass(item)}
                          className="hover:bg-[#0D1E36]/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-white">{t(`days.${item.dayOfWeek}.name`)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.startTime} - {item.endTime}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{item.groupName}</td>
                          <td className="py-3.5 px-4 text-slate-400">{item.programName}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#070F1E] border border-slate-800 text-slate-300">
                              {item.room}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant={item.isToday ? 'green' : 'teal'}>
                              {item.isToday ? t('common.today') : t('status.active')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Class Details Modal */}
      <Modal isOpen={!!activeClass} onClose={() => setActiveClass(null)} title={t('schedule.classDetails')}>
        {activeClass && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800 space-y-2">
              <Badge variant="teal">{activeClass.programName}</Badge>
              <h3 className="text-xl font-black text-white">{activeClass.groupName}</h3>
              <p className="text-xs text-slate-400">{t(`days.${activeClass.dayOfWeek}.name`)} • {activeClass.startTime} - {activeClass.endTime}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#070F1E] border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[11px] font-semibold">{t('schedule.roomLabel')}</span>
                <span className="font-bold text-white">{activeClass.room}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#070F1E] border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[11px] font-semibold">{t('schedule.statusLabel')}</span>
                <span className="font-bold text-emerald-400">{t('status.verified')}</span>
              </div>
            </div>

            <Button onClick={() => setActiveClass(null)} className="w-full py-2.5 font-bold text-xs">
              <span>{t('common.close')}</span>
            </Button>
          </div>
        )}
      </Modal>
    </PortalLayout>
  );
}

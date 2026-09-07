'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '../ui/Badge';
import { Sparkles, Bell } from 'lucide-react';

export const PortalHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { profile, role } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [locale]);

  const todayDate = new Date().toLocaleDateString(locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="h-20 bg-[#070F1E]/80 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title || t('common.welcome')}
        </h2>
        <p className="text-xs text-slate-400 capitalize mt-0.5">{todayDate}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center gap-2 bg-[#0D1E36] px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{timeStr}</span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-[#0D1E36] p-1 rounded-xl border border-slate-800">
          {(['en', 'az', 'ru'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                locale === l ? 'bg-[#4CA2B5] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Role Badge */}
        <Badge variant="teal" className="py-1 px-3 text-xs font-bold">
          {t('roles.' + (role || 'student'))}
        </Badge>
      </div>
    </header>
  );
};

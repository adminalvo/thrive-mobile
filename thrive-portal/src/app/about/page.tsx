'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/ui/Logo';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { Button } from '@/components/ui/Button';

export default function AboutSystemPage() {
  const { t, locale } = useLanguage();

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 selection:bg-[#4CA2B5]/30 selection:text-[#5ce1e6] relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Glow */}
      <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#4CA2B5]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar with Centered Logo and Bottom Border */}
      <header className="h-28 max-w-7xl w-full mx-auto px-6 sm:px-10 flex items-center justify-between border-b border-slate-800/80 relative z-20">
        <div className="w-1/3 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D1E36]/90 hover:bg-[#132847] border border-slate-800 hover:border-[#4CA2B5]/50 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'az' ? 'Ana Səhifə' : locale === 'ru' ? 'Главная' : 'Home'}</span>
          </Link>

          <a
            href="https://www.thrive.az"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D1E36]/90 hover:bg-[#132847] border border-slate-800 hover:border-[#4CA2B5]/50 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm group"
          >
            <span>thrive.az</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5ce1e6] transition-colors" />
          </a>
        </div>

        <div className="w-1/3 flex justify-center items-center">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-3">
          <LanguageDropdown />
          <Link href="/login">
            <Button className="text-xs font-bold py-2.5 px-5 shadow-lg shadow-[#4CA2B5]/20 hover:scale-105 transition-all">
              <span>{t('common.login')}</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 relative z-10 space-y-16">
        {/* Page Heading */}
        <div className="border-b border-slate-800/80 pb-8 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#5ce1e6]">
            {t('about.aboutSubtitle')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t('about.aboutTitle')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">
            {t('about.aboutIntro')}
          </p>
        </div>

        {/* 3 Core Pillars in Pure Minimalist Editorial Format */}
        <div className="space-y-12">
          {/* Pillar 1: Students */}
          <div className="space-y-3 border-l-2 border-[#4CA2B5]/40 pl-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>{t('about.sectionStudentsTitle')}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('about.sectionStudentsDesc')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#5ce1e6] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{locale === 'az' ? 'Həftəlik cədvəl, qiymətləndirmə və rəylər' : locale === 'ru' ? 'Расписание, оценки и обратная связь' : 'Timetable, scoring matrix, and feedback'}</span>
            </div>
          </div>

          {/* Pillar 2: Teachers */}
          <div className="space-y-3 border-l-2 border-[#4CA2B5]/40 pl-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>{t('about.sectionTeachersTitle')}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('about.sectionTeachersDesc')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#5ce1e6] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{locale === 'az' ? 'Sürətli davamiyyət və keçmiş tarix kilidi' : locale === 'ru' ? 'Быстрая посещаемость и защита дат' : 'Rapid attendance marker with past-date security lock'}</span>
            </div>
          </div>

          {/* Pillar 3: Parents */}
          <div className="space-y-3 border-l-2 border-emerald-500/40 pl-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>{t('about.sectionParentsTitle')}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('about.sectionParentsDesc')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{locale === 'az' ? '24/7 davamiyyət və ödəniş balansı şəffaflığı' : locale === 'ru' ? '24/7 контроль посещаемости и баланса' : '24/7 verified attendance and tuition transparency'}</span>
            </div>
          </div>

          {/* Real-Time Sync Section */}
          <div className="bg-[#0D1E36]/50 border border-slate-800/80 p-8 rounded-3xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#5ce1e6]" />
              <span>{t('about.featureSyncTitle')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t('about.featureSyncDesc')}
            </p>
          </div>
        </div>

        {/* CTA to Enter Portal via /login */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-400">
            {locale === 'az' ? 'Sistemə daxil olmaq üçün təyin olunmuş giriş məlumatlarınızdan istifadə edin.' : locale === 'ru' ? 'Используйте учетные данные для входа в терминал.' : 'Use your authorized credentials to access your portal.'}
          </p>
          <Link href="/login">
            <Button
              className="py-3.5 px-8 text-xs font-bold shadow-xl shadow-[#4CA2B5]/20 hover:scale-105 transition-all"
            >
              <span>{t('common.enterPortal')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070F1E]/95 py-8 px-6 sm:px-10 relative z-20 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-slate-500">
            <p>© 2026 Thrive Education Portal.</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <span>Developed by </span>
            <span className="text-slate-200 font-bold hover:text-[#5ce1e6] transition-colors cursor-default">HacTag</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/ui/Logo';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';

export default function TermsOfServicePage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 selection:bg-[#4CA2B5]/30 selection:text-[#5ce1e6] flex flex-col justify-between">
      {/* Top Navbar with Centered Logo and Bottom Border */}
      <header className="h-24 max-w-7xl w-full mx-auto px-6 sm:px-10 flex items-center justify-between border-b border-slate-800/80 relative z-20">
        <div className="w-1/3 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D1E36]/90 hover:bg-[#132847] border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'az' ? 'Ana Səhifə' : locale === 'ru' ? 'Главная' : 'Home'}</span>
          </Link>
        </div>

        <div className="w-1/3 flex justify-center">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>

        <div className="w-1/3 flex justify-end">
          <LanguageDropdown />
        </div>
      </header>

      {/* Main Legal Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-14 relative z-10 space-y-12 my-auto">
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#5ce1e6] flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{locale === 'az' ? 'İstifadə Qaydaları' : locale === 'ru' ? 'Условия использования' : 'Terms & Conditions'}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {locale === 'az' ? 'İstifadə Şərtləri (Terms of Service)' : locale === 'ru' ? 'Условия Использования' : 'Terms of Service'}
          </h1>
          <p className="text-xs text-slate-400">
            {locale === 'az' ? 'Son yenilənmə tarixi: 24 Fevral 2026' : locale === 'ru' ? 'Последнее обновление: 24 Февраля 2026' : 'Last Updated: February 24, 2026'}
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6]" />
              <span>{locale === 'az' ? '1. Giriş və Hesab Təhlükəsizliyi' : locale === 'ru' ? '1. Доступ и безопасность аккаунта' : '1. Access & Account Integrity'}</span>
            </h2>
            <p>
              {locale === 'az'
                ? 'Thrive Portal-dan istifadə hüququ yalnız Thrive Tədris Mərkəzinin aktiv tələbələrinə, müəllimlərinə və valideynlərinə məxsusdur. İstifadəçi adı və şifrənin məxfiliyinə cavabdehlik istifadəçiyə aiddir.'
                : locale === 'ru'
                ? 'Доступ к порталу предоставляется исключительно активным студентам, преподавателям и родителям учебного центра Thrive.'
                : 'Access to Thrive Portal is restricted to verified students, faculty members, and parents registered with Thrive Education Center.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6]" />
              <span>{locale === 'az' ? '2. Davamiyyət və Akademik Qeydiyyat Qaydaları' : locale === 'ru' ? '2. Правила посещаемости и оценок' : '2. Attendance & Academic Rules'}</span>
            </h2>
            <p>
              {locale === 'az'
                ? 'Müəllimlər tərəfindən daxil edilən davamiyyət və qiymətlər rəsmi tədris qeydi sayılır. Keçmiş dərslərin davamiyyətinə kənar müdaxilə və icazəsiz dəyişikliklər sistem tərəfindən avtomatik bloklanır.'
                : locale === 'ru'
                ? 'Посещаемость и оценки, внесенные преподавателями, являются официальными академическими записями и защищены от несанкционированных изменений.'
                : 'Attendance and grades recorded by faculty serve as official records. Unauthorized alterations to past records are strictly locked by the core engine.'}
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070F1E]/95 py-6 px-6 sm:px-10 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Thrive Education Portal. All rights reserved.</p>
          <p className="text-slate-400">Developed by <span className="text-white font-bold">HacTag</span></p>
        </div>
      </footer>
    </div>
  );
}

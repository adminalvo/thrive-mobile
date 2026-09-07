'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Server, Cpu, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/ui/Logo';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';

export default function SecurityPage() {
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

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-14 relative z-10 space-y-12 my-auto">
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#5ce1e6] flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>{locale === 'az' ? 'Təhlükəsizlik Standartları' : locale === 'ru' ? 'Безопасность системы' : 'Security Architecture'}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {locale === 'az' ? 'Sistem Təhlükəsizliyi və Mühafizə' : locale === 'ru' ? 'Безопасность и Защита Данных' : 'Security & Data Safeguards'}
          </h1>
          <p className="text-xs text-slate-400">
            {locale === 'az' ? 'Enterprise Səviyyəli Akademik İdarəetmə Mühafizəsi' : locale === 'ru' ? 'Корпоративный уровень защиты данных' : 'Enterprise-Grade Academic Data Protection'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#0D1E36]/60 border border-slate-800 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4CA2B5]/15 border border-[#4CA2B5]/30 flex items-center justify-center text-[#5ce1e6]">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">256-Bit SSL & TLS Encryption</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {locale === 'az' ? 'Bütün məlumat ötürmələri ən son TLS 1.3 və 256-bit SSL şifrələmə standartları ilə qorunur.' : 'All client-server data transmissions are protected via TLS 1.3 protocols.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1E36]/60 border border-slate-800 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4CA2B5]/15 border border-[#4CA2B5]/30 flex items-center justify-center text-[#5ce1e6]">
              <Server className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Time-Locked Attendance Integrity</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {locale === 'az' ? 'Keçmiş dərslərin davamiyyətinin qəsdən və ya yanlışlıqla dəyişdirilməsinin qarşısını alan avtomatik tarix kilidi.' : 'Automatic date safeguards prevent retroactive alteration of attendance records.'}
            </p>
          </div>
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

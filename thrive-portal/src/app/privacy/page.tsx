'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/ui/Logo';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-4 h-4" />
            <span>{locale === 'az' ? 'Məxfilik və Məlumatların Qorunması' : locale === 'ru' ? 'Конфиденциальность' : 'Privacy & Compliance'}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {locale === 'az' ? 'Məxfilik Siyasəti (Privacy Policy)' : locale === 'ru' ? 'Политика Конфиденциальности' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-400">
            {locale === 'az' ? 'Son yenilənmə tarixi: 24 Fevral 2026' : locale === 'ru' ? 'Последнее обновление: 24 Февраля 2026' : 'Last Updated: February 24, 2026'}
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6]" />
              <span>{locale === 'az' ? '1. Məlumatların Toplanması və Məqsədi' : locale === 'ru' ? '1. Сбор и использование данных' : '1. Data Collection & Purpose'}</span>
            </h2>
            <p>
              {locale === 'az'
                ? 'Thrive Portal yalnız tədris mərkəzində qeydiyyatdan keçmiş tələbələrin, müəllimlərin və valideynlərin tədris prosesini təmin etmək üçün zəruri olan məlumatları (ad, soyad, əlaqə nömrəsi, dərs davamiyyəti, imtahan nəticələri və təhsil haqqı qeydləri) toplayır və saxlayır.'
                : locale === 'ru'
                ? 'Thrive Portal собирает и обрабатывает только данные, необходимые для обеспечения учебного процесса (ФИО, контакты, посещаемость, оценки и баланс оплаты).'
                : 'Thrive Portal collects only data necessary for academic operations, including names, contact details, attendance logs, exam scores, and tuition records.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6]" />
              <span>{locale === 'az' ? '2. Məlumatların Təhlükəsizliyi və Şifrələnməsi' : locale === 'ru' ? '2. Безопасность и шифрование' : '2. Security & Encryption'}</span>
            </h2>
            <p>
              {locale === 'az'
                ? 'Bütün akademik və şəxsi məlumatlar 256-bit SSL şifrələmə protokolları ilə qorunur və təhlükəsiz Supabase PostgreSQL bazasında saxlanılır. İstifadəçi parolları heç vaxt açıq şəkildə saxlanılmır və yüksək təhlükəsizlik standartlarına uyğun heşlənir.'
                : locale === 'ru'
                ? 'Все данные защищены 256-битным SSL шифрованием и хранятся в защищенной базе данных Supabase PostgreSQL. Пароли пользователей никогда не хранятся в открытом виде.'
                : 'All academic and personal records are encrypted with 256-bit SSL and stored in a secure Supabase PostgreSQL database. User passwords are encrypted with industry-standard cryptographic hashing.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6]" />
              <span>{locale === 'az' ? '3. Üçüncü Tərəflərə Verilməmə Zəmanəti' : locale === 'ru' ? '3. Защита от третьих лиц' : '3. Third-Party Confidentiality'}</span>
            </h2>
            <p>
              {locale === 'az'
                ? 'Toplanan heç bir şəxsi məlumat reklam, marketinq və ya kommersiya məqsədilə üçüncü tərəflərə ötürülmür və satılmır.'
                : locale === 'ru'
                ? 'Никакие персональные данные не передаются и не продаются третьим лицам в рекламных или коммерческих целях.'
                : 'No personal or academic records are shared or sold to third parties for marketing or advertising purposes.'}
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

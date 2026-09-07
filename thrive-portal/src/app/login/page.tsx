'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function CleanMinimalistLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t, locale } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(locale === 'az' ? 'Zəhmət olmasa bütün xanaları doldurun' : 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(locale === 'az' ? 'Uğurla daxil oldunuz' : 'Access Granted');
      const targetRole = res.role || 'student';
      router.push(`/${targetRole}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 selection:bg-[#4CA2B5]/30 selection:text-[#5ce1e6] relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Cyber Ambient Glow */}
      <div className="absolute top-[-25%] left-1/3 w-[800px] h-[500px] bg-gradient-to-b from-[#4CA2B5]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Top Controls: Back to Home & Language Selector */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-8 flex items-center justify-between relative z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-[#0D1E36]/90 hover:bg-[#132847] border border-slate-800 hover:border-[#4CA2B5]/50 px-4 py-2 rounded-xl transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#5ce1e6] transition-colors" />
          <span>{locale === 'az' ? 'Ana səhifəyə qayıt' : locale === 'ru' ? 'Вернуться на главную' : 'Back to Home'}</span>
        </Link>

        <LanguageDropdown />
      </div>

      {/* Main Split Screen Area with Sharp Center Divider */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 relative z-20 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Sharp Minimalist Brand Identity */}
          <div className="space-y-6 text-left lg:border-r lg:border-slate-800/80 lg:pr-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CA2B5]/10 border border-[#4CA2B5]/20 text-[#5ce1e6] text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thrive Academic Ecosystem</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Thrive Education Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                {locale === 'az'
                  ? 'Tələbələr, müəllimlər və valideynlərin akademik fəaliyyətini vahid mərkəzdə birləşdirən rəsmi idarəetmə terminalı.'
                  : locale === 'ru'
                  ? 'Официальный терминал управления учебным процессом для студентов, преподавателей и родителей.'
                  : 'Official academic management terminal unifying students, faculty, and guardians in a single environment.'}
              </p>
            </div>
          </div>

          {/* Right Column: Sharp Minimalist Direct Authentication Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-[#0D1E36]/70 border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-wide">
                  {locale === 'az' ? 'Kabinetə Daxil Ol' : locale === 'ru' ? 'Вход в Кабинет' : 'Portal Sign In'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {locale === 'az'
                    ? 'Email və ya telefon nömrənizlə birbaşa daxil olun'
                    : 'Enter your email or phone number to sign in directly'}
                </p>
              </div>

              {/* Direct Credentials Form (Auto Role Resolution) */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('common.emailOrPhone')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@thrive.az or +994..."
                      className="w-full bg-[#070F1E] border border-slate-700/80 rounded-xl px-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4CA2B5] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('common.password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#070F1E] border border-slate-700/80 rounded-xl px-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4CA2B5] transition-all"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-3.5 font-bold text-xs shadow-xl shadow-[#4CA2B5]/25 hover:scale-[1.01] transition-all rounded-xl mt-2"
                >
                  <span>{locale === 'az' ? 'Kabinetə Daxil Ol' : locale === 'ru' ? 'Войти в кабинет' : 'Authenticate & Enter'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Bottom Spacer */}
      <div className="h-8 relative z-10" />
    </div>
  );
}

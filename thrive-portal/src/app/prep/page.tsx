'use client';

import React, { useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  Layers,
  Clock,
  Trophy,
  CheckCircle2,
  Cpu,
  Compass,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThrivePrepComingSoonPage() {
  const { t, locale } = useLanguage();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    toast.success(t('prep.notifySuccess'));
  };

  const featureCards = [
    {
      icon: Target,
      title: t('prep.satSimulator'),
      desc: t('prep.satSimulatorDesc'),
      tags: ['SAT Math', 'SAT Reading & Writing', 'Desmos Graphing'],
      gradient: 'from-[#4CA2B5]/20 via-[#4CA2B5]/5 to-transparent',
      borderColor: 'border-[#4CA2B5]/40'
    },
    {
      icon: Cpu,
      title: t('prep.ieltsAi'),
      desc: t('prep.ieltsAiDesc'),
      tags: ['Speaking AI', 'Writing Task 1 & 2', 'Band 9 Rubric'],
      gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/40'
    },
    {
      icon: Compass,
      title: t('prep.weakPointRadar'),
      desc: t('prep.weakPointRadarDesc'),
      tags: ['Pattern Detection', 'Targeted Remediation', 'Error Log'],
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/40'
    },
    {
      icon: Layers,
      title: t('prep.spacedRepetition'),
      desc: t('prep.spacedRepetitionDesc'),
      tags: ['High-Frequency Vocab', 'Math Formulas', 'Anki Algorithm'],
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/40'
    },
    {
      icon: Clock,
      title: t('prep.fullSimulators'),
      desc: t('prep.fullSimulatorsDesc'),
      tags: ['Proctored Environment', 'Score Predictor', 'Percentiles'],
      gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/40'
    },
    {
      icon: Trophy,
      title: t('prep.gamifiedStreak'),
      desc: t('prep.gamifiedStreakDesc'),
      tags: ['Daily Streaks', 'XP Multipliers', 'Cohort Rankings'],
      gradient: 'from-pink-500/20 via-pink-500/5 to-transparent',
      borderColor: 'border-pink-500/40'
    }
  ];

  return (
    <PortalLayout title="ThrivePrep">
      <div className="space-y-10 max-w-6xl mx-auto py-4">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0D1E36] via-[#0A192F] to-[#070F1E] border border-slate-800 p-8 sm:p-12 shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4CA2B5]/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4CA2B5]/15 border border-[#4CA2B5]/30 text-[#5ce1e6] text-xs font-black tracking-wide shadow-md">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{t('prep.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {t('prep.title')}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              {t('prep.subtitle')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#070F1E] border border-slate-800 text-xs font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>{t('prep.phaseNotice')}</span>
              </div>
            </div>

            {/* Early Access Notification Form */}
            <form onSubmit={handleSubscribe} className="pt-4 max-w-md mx-auto flex items-center gap-2">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t('prep.notifyPlaceholder')}
                disabled={subscribed}
                className="flex-1 bg-[#070F1E] border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4CA2B5] transition-all disabled:opacity-50"
              />
              <Button type="submit" disabled={subscribed} className="py-3 px-5 font-bold text-xs shrink-0 rounded-2xl">
                <span>{subscribed ? <CheckCircle2 className="w-4 h-4" /> : t('prep.notifyMe')}</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#5ce1e6]" />
              <span>{locale === 'az' ? 'Sistemin Əsas Funksiyaları' : locale === 'ru' ? 'Ключевые модули системы' : 'Ecosystem Architecture'}</span>
            </h2>
            <Badge variant="teal">6 Core Modules</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl bg-gradient-to-b ${feat.gradient} bg-[#0D1E36]/80 border ${feat.borderColor} space-y-4 shadow-xl backdrop-blur-md hover:scale-[1.02] transition-all group`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-center text-[#5ce1e6] group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[#5ce1e6] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-800/80">
                    {feat.tags.map((tg, i) => (
                      <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#070F1E] border border-slate-800 text-slate-400">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Ecosystem Sync Banner */}
        <div className="p-6 rounded-3xl bg-[#0D1E36]/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4CA2B5]/15 border border-[#4CA2B5]/30 flex items-center justify-center text-[#5ce1e6]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {locale === 'az' ? 'Avtomatik Sinxronizasiya' : 'Real-Time Sync Protocol'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('prep.syncNote')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="green">Connected</Badge>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

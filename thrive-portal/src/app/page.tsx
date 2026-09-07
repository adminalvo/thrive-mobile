'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/ui/Logo';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { Button } from '@/components/ui/Button';

export default function MasterLandingPage() {
  const { t, locale } = useLanguage();

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 selection:bg-[#4CA2B5]/30 selection:text-[#5ce1e6] relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Glow */}
      <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#4CA2B5]/12 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Top Navbar with Centered Logo and Crisp Bottom Divider Line */}
      <header className="h-28 max-w-7xl w-full mx-auto px-6 sm:px-10 flex items-center justify-between border-b border-slate-800/80 relative z-20">
        {/* Left Navigation Links */}
        <div className="w-1/3 flex items-center gap-3">
          <Link
            href="/about"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D1E36]/90 hover:bg-[#132847] border border-slate-800 hover:border-[#4CA2B5]/50 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-[#5ce1e6]" />
            <span>{locale === 'az' ? 'Haqqında' : locale === 'ru' ? 'О системе' : 'About'}</span>
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

        {/* Center Logo - Perfectly Centered */}
        <div className="w-1/3 flex justify-center items-center">
          <Link href="/" className="transition-transform hover:scale-105">
            <Logo size="lg" />
          </Link>
        </div>

        {/* Right Controls */}
        <div className="w-1/3 flex justify-end items-center gap-3">
          <LanguageDropdown />
        </div>
      </header>

      {/* Detailed & Rich Banner / Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-6 py-16 relative z-10 text-center my-auto space-y-10">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D1E36]/90 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{locale === 'az' ? 'Thrive Tədris Mərkəzi — Rəsmi Akademik Terminal' : locale === 'ru' ? 'Официальный Академический Терминал Thrive' : 'Thrive Education Center — Official Academic Terminal'}</span>
        </div>

        {/* Main Banner Heading */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-2xl">
            Thrive Education Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {locale === 'az'
              ? 'Tələbələr, Müəllimlər və Valideynlər üçün həftəlik dərs cədvəli, real-vaxt davamiyyət qeydiyyatı və akademik nəticələrin vahid idarəetmə mühiti.'
              : locale === 'ru'
              ? 'Единая система управления расписанием, посещаемостью и академическими результатами для студентов, преподавателей и родителей.'
              : 'Unified academic environment for students, educators, and guardians featuring real-time timetables, attendance verification, and performance insights.'}
          </p>
        </div>

        {/* Single Primary Action Button Directing to /login */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/login">
            <Button
              size="lg"
              className="py-4 px-12 text-sm font-black tracking-wide shadow-2xl shadow-[#4CA2B5]/30 hover:scale-105 transition-all rounded-2xl"
            >
              <span>{t('common.enterPortal')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link
            href="/about"
            className="px-8 py-4 rounded-2xl bg-[#0D1E36]/80 hover:bg-[#132847] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md"
          >
            <span>{locale === 'az' ? 'Sistem Haqqında Ətraflı' : locale === 'ru' ? 'Подробнее о системе' : 'Explore System Details'}</span>
          </Link>
        </div>
      </main>

      {/* Footer with Minimalist Developed by HacTag and Legal Compliance Links */}
      <footer className="border-t border-slate-800/80 bg-[#070F1E]/95 py-8 px-6 sm:px-10 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright & Legal Links */}
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

          {/* Genuine App Store & Google Play Badges */}
          <div className="flex items-center gap-3">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-black hover:bg-zinc-900 border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
            >
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.12-10.27-1.99-14.76-6.35-3.35-3.03-7.23-7.79-11.64-14.28-5.69-8.4-10.23-18.06-13.62-28.98-3.39-10.92-5.08-21.36-5.08-31.33 0-14.42 3.69-26.4 11.08-35.94 7.39-9.54 16.71-14.37 27.97-14.49 4.36 0 9.29 1.11 14.78 3.33 5.49 2.22 9.07 3.39 10.74 3.51 2.23-.34 6.04-1.63 11.45-3.88 5.41-2.25 10.08-3.3 14.01-3.14 15.54.84 27.69 6.84 36.46 18.01-13.58 8.24-20.24 19.38-19.98 33.43.26 11.02 4.3 20.25 12.12 27.69 3.96 3.82 8.52 6.74 13.69 8.76-1.08 3.3-2.31 6.64-3.68 10.03zM119.22 33.82c0-7.39 2.65-14.37 7.95-20.94 5.3-6.57 11.83-10.87 19.59-12.88 1.08 7.39-1.28 14.54-7.08 21.46-5.8 6.92-12.63 11.02-20.46 12.36z"/>
              </svg>
              <span className="text-[11px] font-bold text-white">App Store</span>
            </a>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-black hover:bg-zinc-900 border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 512 512">
                <path fill="#4285F4" d="M47.2 12.8C42.8 17.6 40 25.1 40 35.1v441.8c0 10 2.8 17.5 7.2 22.3L275.5 256 47.2 12.8z"/>
                <path fill="#FBBC04" d="M352.5 179L275.5 256l77 77 87.2-49.8c12.4-7.1 19.3-17.6 19.3-27.2s-6.9-20.1-19.3-27.2L352.5 179z"/>
                <path fill="#EA4335" d="M275.5 256L47.2 499.2c7.6 8 20.3 8.7 34.6.6l270.7-154.8L275.5 256z"/>
                <path fill="#34A853" d="M352.5 179L81.8 24.2C67.5 16.1 54.8 16.8 47.2 24.8L275.5 256l77-77z"/>
              </svg>
              <span className="text-[11px] font-bold text-white">Google Play</span>
            </a>
          </div>

          {/* Minimalist Developed by HacTag Signature */}
          <div className="text-xs text-slate-500">
            <span>Developed by </span>
            <span className="text-slate-200 font-bold hover:text-[#5ce1e6] transition-colors cursor-default">HacTag</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

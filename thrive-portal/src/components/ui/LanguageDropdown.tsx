'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LocaleType } from '@/context/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';

export const LanguageDropdown: React.FC = () => {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: LocaleType; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#0D1E36]/90 hover:bg-[#132847] border border-slate-800 hover:border-[#4CA2B5]/50 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-sm"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="uppercase tracking-wider">{currentLang.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#0D1E36]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                locale === lang.code
                  ? 'bg-[#4CA2B5]/20 text-[#5ce1e6] font-bold'
                  : 'text-slate-300 hover:bg-[#132847] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {locale === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

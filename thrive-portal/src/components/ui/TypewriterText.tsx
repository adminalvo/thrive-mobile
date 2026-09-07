'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export const TypewriterText: React.FC = () => {
  const { locale } = useLanguage();

  const phraseSets: Record<string, string[]> = {
    en: [
      'Academic Excellence',
      'Smart Learning',
      'Student Success',
      'Future of Education',
    ],
    az: [
      'Akademik İnkişaf',
      'Ağıllı Tədris',
      'Tələbə Uğuru',
      'Gələcəyin Təhsili',
    ],
    ru: [
      'Академический Успех',
      'Умное Обучение',
      'Успех Студентов',
      'Будущее Образования',
    ],
  };

  const phrases = phraseSets[locale] || phraseSets.en;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPhraseIndex(0);
    setCharIndex(0);
    setIsDeleting(false);
  }, [locale]);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex % phrases.length];

    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentPhrase.length) {
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 90);
    } else if (!isDeleting && charIndex === currentPhrase.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev - 1);
      }, 45);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases]);

  const currentPhrase = phrases[phraseIndex % phrases.length];
  const displayedText = currentPhrase.substring(0, charIndex);

  return (
    <span className="inline-flex items-center">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#5ce1e6] font-extrabold">
        {displayedText}
      </span>
      <span className="animate-pulse text-[#5ce1e6] ml-1 font-light opacity-80">|</span>
    </span>
  );
};

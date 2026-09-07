'use client';

import React, { useState, useEffect } from 'react';

export const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if already loaded in this session to keep internal nav instant
    const hasLoaded = sessionStorage.getItem('thrive_preloader_shown');
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    // Step-by-step progress reaching 100%
    const t1 = setTimeout(() => setProgress(25), 100);
    const t2 = setTimeout(() => setProgress(55), 300);
    const t3 = setTimeout(() => setProgress(85), 550);
    const t4 = setTimeout(() => setProgress(100), 800);

    // ONLY after 100% is reached and visible, trigger fadeout
    const t5 = setTimeout(() => setFadeOut(true), 1200);

    // Complete transition and unmount
    const t6 = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('thrive_preloader_shown', 'true');
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#070F1E] flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        fadeOut ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Neon Aura */}
      <div className="absolute w-[450px] h-[450px] bg-gradient-to-b from-[#4CA2B5]/20 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Center: Large Logo + Precision Loading Bar */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Large Prominent Logo */}
        <img
          src="/logo.png"
          alt="Thrive"
          className="h-28 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_0_40px_rgba(92,225,230,0.55)] transition-all"
        />

        {/* Minimalist 100% Loading Bar */}
        <div className="w-48 sm:w-60 h-[2px] bg-slate-800/90 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#4CA2B5] to-[#5ce1e6] shadow-[0_0_15px_#5ce1e6] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

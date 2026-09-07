'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import az from '../locales/az.json';
import ru from '../locales/ru.json';

export type LocaleType = 'en' | 'az' | 'ru';
const translations: Record<LocaleType, any> = { en, az, ru };

interface LanguageContextProps {
  locale: LocaleType;
  setLocale: (l: LocaleType) => void;
  t: (key: string, params?: Record<string, string | number>) => any;
}

const LanguageContext = createContext<LanguageContextProps>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleType>('en');

  useEffect(() => {
    const saved = localStorage.getItem('thrive_portal_lang') as LocaleType;
    if (saved && (saved === 'en' || saved === 'az' || saved === 'ru')) {
      setLocaleState(saved);
    } else {
      setLocaleState('en');
    }
  }, []);

  const setLocale = (l: LocaleType) => {
    setLocaleState(l);
    localStorage.setItem('thrive_portal_lang', l);
  };

  const t = (key: string, params?: Record<string, string | number>): any => {
    const parts = key.split('.');
    let current: any = translations[locale];
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        let fallback = translations['en'];
        for (const p of parts) {
          if (fallback && fallback[p] !== undefined) {
            fallback = fallback[p];
          } else {
            return key;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === 'string' && params) {
      let result = current;
      for (const [paramKey, paramVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }
      return result;
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

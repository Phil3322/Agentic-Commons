"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '@/translations/fr';

export type Language = 'en' | 'fr';

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('ac_lang') as Language;
    if (saved === 'fr' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('ac_lang', l);
  };

  const t = (key: string): string => {
    if (lang === 'en') return key;
    // Strip whitespace to ensure robustness if components use templating
    return fr[key.trim()] || key; 
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

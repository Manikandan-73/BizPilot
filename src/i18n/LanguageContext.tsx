import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallback?: string) => string;
  isTamil: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'bizpilot_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'ta') {
        return saved;
      }
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  /**
   * Translates a dot-notated key path, e.g. "nav.dashboard" or "executive.kpiHealth".
   * Falls back to English, then to provided fallback or path itself.
   */
  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    
    // 1. Try active language dictionary
    let current: any = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    // 2. Fallback to English dictionary if active is not English
    if (language !== 'en') {
      let enCurrent: any = translations.en;
      for (const key of keys) {
        if (enCurrent && typeof enCurrent === 'object' && key in enCurrent) {
          enCurrent = enCurrent[key];
        } else {
          enCurrent = undefined;
          break;
        }
      }
      if (typeof enCurrent === 'string') {
        return enCurrent;
      }
    }

    // 3. Fallback string or path
    return fallback !== undefined ? fallback : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTamil: language === 'ta' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

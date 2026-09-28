import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  translations,
  Translations,
  formatMemberName,
  formatMemberNameShort,
  formatMemberRole,
  formatMemberBranch,
  formatMemberRootSummary,
} from '../utils/translations';
import { FamilyMember } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  getName: (member: { id: string; firstName: string; lastName?: string; firstNameMl?: string; lastNameMl?: string }) => string;
  getShortName: (member: { id: string; firstName: string; firstNameMl?: string }) => string;
  getRole: (member: { id: string; role: string; roleMl?: string }) => string;
  getBranch: (member: { id: string; branch: string; branchMl?: string }) => string;
  getRootSummary: (memberId: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mayankutty_lang');
    if (saved === 'en' || saved === 'ml') {
      return saved;
    }
    // Default to Malayalam as requested by the user ("GIVE LANGUAGE CHANGE OPTION IN MALAYALAM")
    return 'ml';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mayankutty_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ml' ? 'en' : 'ml');
  };

  useEffect(() => {
    localStorage.setItem('mayankutty_lang', language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
    getName: (member) => formatMemberName(member, language),
    getShortName: (member) => formatMemberNameShort(member, language),
    getRole: (member) => formatMemberRole(member, language),
    getBranch: (member) => formatMemberBranch(member, language),
    getRootSummary: (memberId) => formatMemberRootSummary(memberId, language),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

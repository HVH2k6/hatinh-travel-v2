'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  flag_icon: string | null;
}

const LanguageContext = createContext<Language[]>([]);

export function LanguageProvider({ children, initialLanguages }: { children: React.ReactNode, initialLanguages: Language[] }) {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages || []);

  return (
    <LanguageContext.Provider value={languages}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguages = () => useContext(LanguageContext);
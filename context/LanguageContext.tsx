'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  flag_icon: string | null;
}

const LanguageContext = createContext<Language[]>([]);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        // GỌI API CỦA BẠN TẠI ĐÂY
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/languages`); 
        const json = await res.json();
        if (json.success) {
          setLanguages(json.data);
        }
      } catch (error) {
        console.error("Lỗi fetch danh sách ngôn ngữ:", error);
      }
    };

    fetchLanguages();
  }, []); // Array rỗng để chỉ chạy 1 lần duy nhất

  return (
    <LanguageContext.Provider value={languages}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguages = () => useContext(LanguageContext);
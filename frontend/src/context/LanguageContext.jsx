import { createContext, useContext, useState } from 'react';
import es from '../i18n/es.json';
import en from '../i18n/en.json';

const LanguageContext = createContext(null);

const translations = { es, en };

export function LanguageProvider({ children }) {
  const [idioma, setIdioma] = useState('es');

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[idioma];
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  };

  const toggleIdioma = () => {
    setIdioma(prev => prev === 'es' ? 'en' : 'es');
  };

  return (
    <LanguageContext.Provider value={{ idioma, t, toggleIdioma }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de/translation.json';
import en from './locales/en/translation.json';
import vi from './locales/vi/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      vi: { translation: vi },
      en: { translation: en }
    },
    lng: localStorage.getItem('lng') || 'de', // Sprache merken
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import az from '../locales/az.json';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

const resources = {
  az: { translation: az },
  en: { translation: en },
  ru: { translation: ru },
};

// Fallback logic
const getDeviceLanguage = () => {
  const lang = Localization.getLocales()[0]?.languageCode;
  if (resources[lang]) {
    return lang;
  }
  return 'az'; // Default language
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'az',
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import eng from './eng.json';
import est from './est.json';


i18n.use(initReactI18next).init({
  resources: {
    est: {translation : est},
    eng: {translation : eng}
  },
  lng: 'est',
  fallbackLng: 'eng',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
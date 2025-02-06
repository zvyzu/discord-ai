import config from './config';
import i18next from 'i18next';
import en from '../locales/en.json';
import id from '../locales/id.json';

i18next.init({
  debug: false,
  resources: {
    en: {
      translation: en
    },
    id: {
      translation: id
    }
  },
  lng: config.locales.LANG || 'en',
  fallbackLng: 'en',
  parseMissingKeyHandler: (key: string) => {
    console.error(`Translation Key Not Found: ${key}`)
    return 'Check /locales/<LANG>.json, Add if undefined!';
  }
});

export default i18next.t;
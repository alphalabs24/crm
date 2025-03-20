import { APP_LOCALES } from 'twenty-shared';

export const mapLocaleToImageSuffix = (locale: string) => {
  switch (locale) {
    case APP_LOCALES.en:
      return 'en';
    case APP_LOCALES['de-DE']:
      return 'de';
    case APP_LOCALES['fr-FR']:
      return 'fr';
    case APP_LOCALES['it-IT']:
      return 'it';
    default:
      return 'en';
  }
};

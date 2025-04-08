import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
import { APP_LOCALES, isDefined, isValidLocale } from 'twenty-shared';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const mapNavigatorLocaleToLocale = (navigatorLocale: string) => {
  switch (navigatorLocale) {
    case 'en':
      return APP_LOCALES.en;
    case 'de':
      return APP_LOCALES['de-DE'];
    case 'fr':
      return APP_LOCALES['fr-FR'];
    case 'it':
      return APP_LOCALES['it-IT'];
    default:
      return APP_LOCALES.en;
  }
};

export const initialI18nActivate = () => {
  const urlLocale = fromUrl('locale');
  const storageLocale = fromStorage('locale');
  const navigatorLocale = fromNavigator();

  let locale: keyof typeof APP_LOCALES = APP_LOCALES.en;

  if (isDefined(urlLocale) && isValidLocale(urlLocale)) {
    locale = urlLocale;
    try {
      localStorage.setItem('locale', urlLocale);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
  } else if (isDefined(storageLocale) && isValidLocale(storageLocale)) {
    locale = storageLocale;
  } else if (
    isDefined(navigatorLocale) &&
    isValidLocale(mapNavigatorLocaleToLocale(navigatorLocale))
  ) {
    locale = mapNavigatorLocaleToLocale(navigatorLocale);
  }

  dynamicActivate(locale);
};

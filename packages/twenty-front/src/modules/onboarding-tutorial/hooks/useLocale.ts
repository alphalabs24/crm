import { useLingui } from '@lingui/react';

export const useLocale = () => {
  const { i18n } = useLingui();
  return i18n.locale;
};

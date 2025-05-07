import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from './useSystemColorScheme';

export const useSafeColorScheme = () => {
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  return colorSchemeToUse;
};

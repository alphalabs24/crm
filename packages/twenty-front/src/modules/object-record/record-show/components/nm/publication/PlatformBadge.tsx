import { useLocale } from '@/onboarding-tutorial/hooks/useLocale';
import {
  PLATFORMS,
  PlatformId,
  PlatformLocaleKey,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import styled from '@emotion/styled';

const StyledPlatformBadge = styled.div<{
  size: PlatformSize;
  variant: PlatformVariant;
  isActive?: boolean;
  disabled?: boolean;
  dark?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  border: 1px solid
    ${({ theme, isActive, variant }) =>
      variant === 'no-background'
        ? 'transparent'
        : isActive
          ? theme.border.color.strong
          : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ size }) => {
    switch (size) {
      case 'tiny':
        return '18px';
      case 'small':
        return '20px';
      default:
        return '30px';
    }
  }};
  width: ${({ size }) => {
    switch (size) {
      case 'tiny':
        return '50px';
      case 'small':
        return '60px';
      default:
        return '80px';
    }
  }};
  justify-content: center;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'unset' : 'pointer')};
  background: ${({ theme, disabled, dark, variant }) =>
    disabled
      ? variant === 'no-background'
        ? 'transparent'
        : dark
          ? theme.background.transparent.lighter
          : theme.background.secondary
      : variant === 'no-background'
        ? 'transparent'
        : dark
          ? theme.background.transparent.lighter
          : theme.background.primary};

  &:hover {
    background: ${({ theme, disabled, dark, variant }) =>
      disabled
        ? variant === 'no-background'
          ? 'transparent'
          : dark
            ? theme.background.transparent.lighter
            : theme.background.secondary
        : variant === 'no-background'
          ? 'transparent'
          : dark
            ? theme.background.transparent.medium
            : theme.background.tertiary};
  }
`;

const StyledPlatformLogo = styled.img<{
  size: PlatformSize;
  dark?: boolean;
}>`
  width: ${({ size }) => {
    switch (size) {
      case 'tiny':
        return '40px';
      case 'small':
        return '50px';
      default:
        return '70px';
    }
  }};
`;

type PlatformBadgeProps = {
  platformId: PlatformId;
  isActive?: boolean;
  onClick?: () => void;
  size?: PlatformSize;
  variant?: PlatformVariant;
};

type PlatformSize = 'default' | 'small' | 'tiny';
type PlatformVariant = 'default' | 'no-background';

export const PlatformBadge = ({
  platformId,
  isActive,
  onClick,
  size = 'default',
  variant = 'default',
}: PlatformBadgeProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'Dark';
  const locale = useLocale();

  const platform =
    PLATFORMS[platformId?.toUpperCase() as keyof typeof PLATFORMS];

  if (!platform) {
    return null;
  }

  return (
    <StyledPlatformBadge
      size={size}
      variant={variant}
      isActive={isActive}
      onClick={onClick}
      dark={isDark}
      disabled={!onClick}
    >
      {platform?.logo && (
        <StyledPlatformLogo
          size={size}
          src={
            platform.logo[locale as PlatformLocaleKey]?.[colorScheme] ??
            platform.logo.en?.Light
          }
          alt={platform.name}
          dark={isDark}
        />
      )}
    </StyledPlatformBadge>
  );
};

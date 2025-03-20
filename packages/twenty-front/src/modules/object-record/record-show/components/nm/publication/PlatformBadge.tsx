import {
  PLATFORMS,
  PlatformId,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import styled from '@emotion/styled';

const StyledPlatformBadge = styled.div<{
  variant: PlatformVariant;
  isActive?: boolean;
  disabled?: boolean;
  dark?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.border.color.strong : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: ${({ variant }) => (variant === 'small' ? '20px' : '30px')};
  width: ${({ variant }) => (variant === 'small' ? '60px' : '80px')};
  justify-content: center;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'unset' : 'pointer')};
  background: ${({ theme, disabled, dark }) =>
    disabled
      ? dark
        ? theme.background.transparent.lighter
        : theme.background.secondary
      : dark
        ? theme.background.transparent.lighter
        : theme.background.primary};

  &:hover {
    background: ${({ theme, disabled, dark }) =>
      disabled
        ? dark
          ? theme.background.transparent.lighter
          : theme.background.secondary
        : dark
          ? theme.background.transparent.medium
          : theme.background.tertiary};
  }
`;

const StyledPlatformLogo = styled.img<{
  variant: PlatformVariant;
  dark?: boolean;
}>`
  width: ${({ variant }) => (variant === 'small' ? '50px' : '70px')};
`;

type PlatformBadgeProps = {
  platformId: PlatformId;
  isActive?: boolean;
  onClick?: () => void;
  variant?: PlatformVariant;
};

type PlatformVariant = 'default' | 'small';

export const PlatformBadge = ({
  platformId,
  isActive,
  onClick,
  variant = 'default',
}: PlatformBadgeProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'Dark';

  const platform =
    PLATFORMS[platformId?.toUpperCase() as keyof typeof PLATFORMS];

  if (!platform) {
    return null;
  }

  return (
    <StyledPlatformBadge
      variant={variant}
      isActive={isActive}
      onClick={onClick}
      dark={isDark}
      disabled={!onClick}
    >
      {platform?.logo && (
        <StyledPlatformLogo
          variant={variant}
          src={platform.logo}
          alt={platform.name}
          dark={isDark}
        />
      )}
    </StyledPlatformBadge>
  );
};

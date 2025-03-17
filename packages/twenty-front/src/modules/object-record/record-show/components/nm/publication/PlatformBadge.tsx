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
  padding: ${({ theme, variant }) =>
    variant === 'small' ? theme.spacing(0.5) : theme.spacing(1)};
  cursor: pointer;
  background: ${({ theme, disabled, dark }) =>
    disabled
      ? dark
        ? theme.background.invertedPrimary
        : theme.background.secondary
      : dark
        ? theme.background.invertedPrimary
        : theme.background.primary};

  &:hover {
    background: ${({ theme, disabled, dark }) =>
      disabled
        ? dark
          ? theme.background.invertedPrimary
          : theme.background.secondary
        : dark
          ? theme.background.invertedPrimary
          : theme.background.primary};
  }
`;

const StyledPlatformLogo = styled.img<{ variant: PlatformVariant }>`
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
  const platform =
    platformId === 'NEWHOME'
      ? PLATFORMS[PlatformId.Newhome]
      : PLATFORMS[platformId];

  return (
    <StyledPlatformBadge
      variant={variant}
      isActive={isActive}
      onClick={onClick}
      dark={colorScheme === 'Dark'}
      disabled={!onClick}
    >
      {platform?.logo && (
        <StyledPlatformLogo
          variant={variant}
          src={platform.logo}
          alt={platform.name}
        />
      )}
    </StyledPlatformBadge>
  );
};

import {
  PLATFORMS,
  PlatformId,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import styled from '@emotion/styled';

const StyledPlatformBadge = styled.div<{
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
  padding: ${({ theme }) => theme.spacing(1)};
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

const StyledPlatformLogo = styled.img`
  width: 70px;
`;

type PlatformBadgeProps = {
  platformId: PlatformId;
  isActive?: boolean;
  onClick?: () => void;
};

export const PlatformBadge = ({
  platformId,
  isActive,
  onClick,
}: PlatformBadgeProps) => {
  const { colorScheme } = useColorScheme();
  const platform =
    // TODO remove this and replace it with enum
    platformId === ('NEWHOME' as unknown as PlatformId)
      ? PLATFORMS[PlatformId.Newhome]
      : PLATFORMS[platformId];

  return (
    <StyledPlatformBadge
      isActive={isActive}
      onClick={onClick}
      dark={colorScheme === 'Dark'}
      disabled={!onClick}
    >
      {platform?.logo && (
        <StyledPlatformLogo src={platform.logo} alt={platform.name} />
      )}
    </StyledPlatformBadge>
  );
};

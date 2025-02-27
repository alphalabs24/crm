import {
  PLATFORMS,
  PlatformId,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import styled from '@emotion/styled';

const StyledPlatformBadge = styled.div<{
  isActive?: boolean;
  disabled?: boolean;
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
  background: ${({ theme, disabled }) =>
    disabled ? theme.background.secondary : theme.background.primary};

  &:hover {
    background: ${({ theme, disabled }) =>
      disabled ? theme.background.secondary : theme.background.primary};
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
  const platform =
    // TODO remove this and replace it with enum
    platformId === ('NEWHOME' as unknown as PlatformId)
      ? PLATFORMS[PlatformId.Newhome]
      : PLATFORMS[platformId];

  return (
    <StyledPlatformBadge
      isActive={isActive}
      onClick={onClick}
      disabled={!onClick}
    >
      {platform?.logo && (
        <StyledPlatformLogo src={platform.logo} alt={platform.name} />
      )}
    </StyledPlatformBadge>
  );
};

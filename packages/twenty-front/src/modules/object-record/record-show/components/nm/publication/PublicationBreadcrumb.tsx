import {
  PlatformId,
  PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import {
  IconChevronLeft,
  LARGE_DESKTOP_VIEWPORT,
  useIsMobile,
} from 'twenty-ui';

const StyledBreadcrumbContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
`;

const StyledBreadcrumbItem = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.75)};
`;

const StyledTopBarButtonContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledBreadcrumbText = styled.div<{ isLast?: boolean }>`
  color: ${({ theme, isLast }) =>
    isLast ? theme.font.color.primary : theme.font.color.tertiary};
  font-weight: ${({ isLast, theme }) =>
    isLast ? theme.font.weight.medium : theme.font.weight.regular};
`;

const StyledPlatformNameBase = styled.div`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 400px;
  }
`;

const StyledPlatformNameText = styled(StyledPlatformNameBase)`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSeparator = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledBackButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  transition: color 150ms ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledUnstyledButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

type PublicationBreadcrumbProps = {
  platformId: PlatformId;
  onBackClick: () => void;
};

export const PublicationBreadcrumb = ({
  platformId,
  onBackClick,
}: PublicationBreadcrumbProps) => {
  return (
    <StyledBreadcrumbContainer>
      <StyledBackButton onClick={onBackClick}>
        <IconChevronLeft size={16} />
      </StyledBackButton>
      <StyledBreadcrumbItem>
        <StyledUnstyledButton onClick={onBackClick}>
          <StyledBreadcrumbText>
            <Trans>Publications</Trans>
          </StyledBreadcrumbText>
        </StyledUnstyledButton>
        <StyledSeparator>/</StyledSeparator>
        <StyledPlatformNameText>
          {PLATFORMS[platformId]?.name || 'Unknown Platform'}
        </StyledPlatformNameText>
      </StyledBreadcrumbItem>
    </StyledBreadcrumbContainer>
  );
};

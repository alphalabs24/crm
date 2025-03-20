import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/components/PageHeader';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconComet, useIsMobile } from 'twenty-ui';

const StyledTopBarButtonContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  overflow: hidden;
  align-items: center;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-direction: row;
  width: 100%;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: row;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};

  flex-wrap: wrap;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const TutorialPageHeader = () => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  const theme = useTheme();
  return (
    <StyledHeader>
      <StyledLeftContainer>
        {!isMobile && !isNavigationDrawerExpanded && (
          <StyledTopBarButtonContainer>
            <NavigationDrawerCollapseButton direction="right" />
          </StyledTopBarButtonContainer>
        )}
        <StyledTopBarIconStyledTitleContainer>
          <StyledIconContainer>
            <IconComet size={theme.icon.size.md} />
          </StyledIconContainer>
          <StyledTitleContainer>
            <Trans>First steps on nestermind</Trans>
          </StyledTitleContainer>
        </StyledTopBarIconStyledTitleContainer>
      </StyledLeftContainer>
      <StyledRightContainer></StyledRightContainer>
    </StyledHeader>
  );
};

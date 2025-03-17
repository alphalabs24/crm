import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/components/PageHeader';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { useIsMobile } from 'twenty-ui';

const StyledTopBarButtonContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
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

  return (
    <StyledHeader>
      <StyledLeftContainer>
        {!isMobile && !isNavigationDrawerExpanded && (
          <StyledTopBarButtonContainer>
            <NavigationDrawerCollapseButton direction="right" />
          </StyledTopBarButtonContainer>
        )}
      </StyledLeftContainer>
      <StyledRightContainer></StyledRightContainer>
    </StyledHeader>
  );
};

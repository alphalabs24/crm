import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { AppPath } from '@/types/AppPath';
import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconCircleCheck, IconCircleDashed } from 'twenty-ui';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

const StyledLink = styled(Link)`
  text-decoration: none;
  width: 100%;
`;

const StyledOnboardingStepsContainer = styled(motion.div)<{
  isNavigationDrawerExpanded?: boolean;
}>`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  position: relative;
  color: ${({ theme }) => theme.font.color.tertiary};
  user-select: none;
  width: ${(props) =>
    !props.isNavigationDrawerExpanded
      ? `calc(${NAV_DRAWER_WIDTHS.menu.desktop.collapsed}px - ${props.theme.spacing(5.5)})`
      : `calc(100% - ${props.theme.spacing(5.5)})`};

  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
    color: ${({ theme }) => theme.font.color.secondary};
    transform: translateY(-${({ theme }) => theme.spacing(0.25)});
  }
  transition: all 0.2s ease-in-out;
`;

const StyledOnboardingTitle = styled(motion.div)<{ $isIntermediate?: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme, $isIntermediate }) =>
    $isIntermediate ? theme.font.size.md : theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme, $isIntermediate }) =>
    $isIntermediate ? theme.spacing(2) : 0};
`;

const StyledCompactTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCollapsedContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledProgressContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledProgressIndicators = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledProgressBar = styled.div<{ $isCompleted: boolean }>`
  background-color: ${({ theme, $isCompleted }) =>
    $isCompleted ? theme.color.blue : theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  flex: 1;
  height: ${({ theme }) => theme.spacing(1)};
  transition: all 0.2s ease-in-out;
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const OnboardingSteps = () => {
  const theme = useTheme();
  const { steps } = useTutorialSteps();
  const { isMatchingLocation } = useIsMatchingLocation();

  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  const isTutorialPage = isMatchingLocation(AppPath.Tutorial);

  const isIntermediate = isNavigationDrawerExpanded;

  const completedSteps = Object.values(steps).filter(
    (step) => step.completed,
  ).length;
  const totalSteps = Object.keys(steps).length;

  return (
    <AnimatePresence mode="wait">
      {isTutorialPage ? null : (
        <StyledLink to={AppPath.Tutorial}>
          <StyledOnboardingStepsContainer
            isNavigationDrawerExpanded={isNavigationDrawerExpanded}
            animate={{
              height: theme.spacing(10),
              padding: isIntermediate ? theme.spacing(2) : theme.spacing(1),
              opacity: 1,
            }}
            exit={{
              height: theme.spacing(10),
              padding: isIntermediate ? theme.spacing(2) : theme.spacing(1),
              opacity: 0,
            }}
            initial={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
          >
            {isIntermediate ? (
              <StyledProgressContainer
                key="intermediate"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.15,
                  ease: 'easeInOut',
                }}
              >
                <StyledOnboardingTitle $isIntermediate>
                  First Steps on Nestermind
                </StyledOnboardingTitle>
                <StyledProgressIndicators>
                  {Object.values(steps).map((step) => (
                    <StyledProgressBar
                      key={step.step.id}
                      $isCompleted={step.completed}
                    />
                  ))}
                </StyledProgressIndicators>
              </StyledProgressContainer>
            ) : (
              <StyledCollapsedContainer>
                <StyledCompactTitle key="collapsed">
                  {completedSteps}/{totalSteps}
                </StyledCompactTitle>
                <StyledIconContainer>
                  {completedSteps === totalSteps ? (
                    <IconCircleCheck size={20} />
                  ) : (
                    <IconCircleDashed size={20} />
                  )}
                </StyledIconContainer>
              </StyledCollapsedContainer>
            )}
          </StyledOnboardingStepsContainer>
        </StyledLink>
      )}
    </AnimatePresence>
  );
};

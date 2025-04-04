import { TutorialPageHeader } from '@/onboarding-tutorial/components/TutorialPageHeader';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ColorScheme,
  IconChevronRight,
  IconCircleCheck,
  IconCircleDashed,
  IconLock,
  MOBILE_VIEWPORT,
} from 'twenty-ui';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  max-width: ${({ theme }) => theme.spacing(400)};
`;

const StyledMaxWidthContainer = styled.div`
  align-self: center;
  max-width: ${({ theme }) => theme.spacing(200)};
  margin: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(4)} 0;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(10)};
  }
`;

const StyledCenter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.lg};
`;

const StyledProgressContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledProgressBar = styled.div`
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(60)};
  background-color: ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  margin: 0 ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledProgressFill = styled.div<{ $progress: number }>`
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 100%;
  transition: width 0.3s ease-in-out;
  width: ${({ $progress }) => `${$progress}%`};
`;

const StyledProgressText = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledProgressTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledStepCard = styled(motion.button)<{
  $isCompleted: boolean;
  $isDisabled: boolean;
  colorScheme?: ColorScheme;
}>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: ${({ colorScheme, theme }) =>
    colorScheme === 'Light'
      ? 'none'
      : `1px solid ${theme.border.color.medium}`};
  border-left: ${({ theme, $isCompleted }) =>
    $isCompleted
      ? `${theme.spacing(1)} solid ${theme.color.green}`
      : `${theme.spacing(1)} solid ${theme.color.blue}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex: 1;
  justify-content: space-between;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.6 : 1)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  width: 100%;
  text-align: left;
`;

const StyledIconContainer = styled.div<{
  $isCompleted: boolean;
  $isDisabled?: boolean;
}>`
  align-items: center;
  color: ${({ theme, $isCompleted, $isDisabled }) =>
    $isDisabled
      ? theme.font.color.tertiary
      : $isCompleted
        ? theme.color.green
        : theme.color.blue};
  display: flex;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledStepLeft = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStepRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledStepContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStepTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledStepDescription = styled.div`
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledStepStatus = styled.div<{ $isCompleted: boolean }>`
  align-items: center;
  color: ${({ theme, $isCompleted }) =>
    $isCompleted ? theme.color.green : theme.color.blue};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const Tutorial = () => {
  const { steps } = useTutorialSteps();
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  const [blockHover, setBlockHover] = useState(true);
  const completedSteps = Object.values(steps).filter(
    (step) => step.completed,
  ).length;
  const totalSteps = Object.keys(steps).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const { t } = useLingui();

  // This makes sure that the entry animation is not broken by the hover animation
  useEffect(() => {
    setTimeout(() => {
      setBlockHover(false);
    }, 1000);
  }, []);

  return (
    <PageContainer>
      <PageTitle title={'Learn about nestermind'} />
      <TutorialPageHeader />

      <PageBody>
        <StyledCenter>
          <StyledMaxWidthContainer>
            <StyledHeader>
              <StyledTitle>
                <Trans>First steps on nestermind</Trans>
              </StyledTitle>
              <StyledSubtitle>
                <Trans>
                  Complete these steps to get started with nestermind and make
                  the most of your experience.
                </Trans>
              </StyledSubtitle>
            </StyledHeader>

            <StyledStepsContainer>
              <StyledProgressContainer>
                <StyledProgressTextContainer>
                  <StyledProgressText>
                    {completedSteps}/{totalSteps}
                  </StyledProgressText>
                  <StyledProgressText>
                    {Math.round(progressPercentage)}% complete
                  </StyledProgressText>
                </StyledProgressTextContainer>
                <StyledProgressBar>
                  <StyledProgressFill $progress={progressPercentage} />
                </StyledProgressBar>
              </StyledProgressContainer>
              {Object.values(steps).map((step, index) => {
                const isDisabled =
                  step.step.requires?.some(
                    (requiredStep) => !steps[requiredStep]?.completed,
                  ) ?? false;

                return (
                  <StyledStepCard
                    colorScheme={colorSchemeToUse}
                    key={step.step.id}
                    $isCompleted={step.completed}
                    $isDisabled={isDisabled}
                    onClick={isDisabled ? undefined : step.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    whileHover={
                      blockHover || isDisabled
                        ? {}
                        : {
                            boxShadow: theme.boxShadow.strong,
                            transform: 'translateY(-2px)',
                          }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <StyledStepLeft>
                      <StyledIconContainer
                        $isCompleted={step.completed}
                        $isDisabled={isDisabled}
                      >
                        {step.completed ? (
                          <IconCircleCheck size={28} />
                        ) : isDisabled ? (
                          <IconLock size={28} />
                        ) : (
                          <IconCircleDashed size={28} />
                        )}
                      </StyledIconContainer>
                      <StyledStepContent>
                        <StyledStepTitle>{step.step.title}</StyledStepTitle>
                        <StyledStepDescription>
                          {step.step.description}
                        </StyledStepDescription>
                        <StyledStepStatus $isCompleted={step.completed}>
                          {step.completed
                            ? t`Completed`
                            : isDisabled
                              ? t`Complete previous steps first`
                              : t`In progress`}
                        </StyledStepStatus>
                      </StyledStepContent>
                    </StyledStepLeft>
                    <StyledStepRight>
                      <IconChevronRight
                        size={20}
                        color={theme.font.color.tertiary}
                      />
                    </StyledStepRight>
                  </StyledStepCard>
                );
              })}
            </StyledStepsContainer>
          </StyledMaxWidthContainer>
        </StyledCenter>
      </PageBody>
    </PageContainer>
  );
};

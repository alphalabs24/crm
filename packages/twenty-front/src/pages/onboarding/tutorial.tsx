import { TutorialPageHeader } from '@/onboarding-tutorial/components/TutorialPageHeader';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { IconChevronRight, IconCircleCheck, IconCircleDashed } from 'twenty-ui';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const StyledCenter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled.h1`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSubtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.font.color.tertiary};
  max-width: ${({ theme }) => theme.spacing(100)};
`;

const StyledProgressContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledProgressBar = styled.div`
  height: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(60)};
  background-color: ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  overflow: hidden;
  margin: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledProgressFill = styled.div<{ $progress: number }>`
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  height: 100%;
  transition: width 0.3s ease-in-out;
  width: ${({ $progress }) => `${$progress}%`};
`;

const StyledProgressText = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: 0 ${({ theme }) => theme.spacing(4)};
  max-width: ${({ theme }) => theme.spacing(140)};
  align-items: center;
`;

const StyledStepCard = styled(motion.div)<{ $isCompleted: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: ${({ theme, $isCompleted }) =>
    $isCompleted
      ? `${theme.spacing(1)} solid ${theme.color.green}`
      : `${theme.spacing(1)} solid ${theme.color.blue}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  display: flex;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
  width: 100%;
`;

const StyledIconContainer = styled.div<{ $isCompleted: boolean }>`
  align-items: center;
  color: ${({ theme, $isCompleted }) =>
    $isCompleted ? theme.color.green : theme.color.blue};
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
  const completedSteps = Object.values(steps).filter(
    (step) => step.completed,
  ).length;
  const totalSteps = Object.keys(steps).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const { t } = useLingui();
  return (
    <PageContainer>
      <TutorialPageHeader />
      <StyledHeader>
        <StyledTitle>
          <Trans>First Steps on Nestermind</Trans>
        </StyledTitle>
        <StyledSubtitle>
          <Trans>
            Complete these steps to get started with Nestermind and make the
            most of your CRM experience.
          </Trans>
        </StyledSubtitle>
      </StyledHeader>

      <StyledCenter>
        <StyledProgressContainer>
          <StyledProgressText>
            {completedSteps}/{totalSteps}
          </StyledProgressText>
          <StyledProgressBar>
            <StyledProgressFill $progress={progressPercentage} />
          </StyledProgressBar>
          <StyledProgressText>
            {Math.round(progressPercentage)}% complete
          </StyledProgressText>
        </StyledProgressContainer>

        <StyledStepsContainer>
          {Object.values(steps).map((step, index) => (
            <StyledStepCard
              key={step.step.id}
              $isCompleted={step.completed}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
              whileHover={{
                boxShadow: theme.boxShadow.strong,
                transform: 'translateY(-2px)',
                cursor: 'pointer',
              }}
              transition={{ duration: 0.3 }}
            >
              <StyledStepLeft>
                <StyledIconContainer $isCompleted={step.completed}>
                  {step.completed ? (
                    <IconCircleCheck size={28} />
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
                    {step.completed ? t`Completed` : t`In progress`}
                  </StyledStepStatus>
                </StyledStepContent>
              </StyledStepLeft>
              <StyledStepRight>
                <IconChevronRight size={20} color={theme.font.color.tertiary} />
              </StyledStepRight>
            </StyledStepCard>
          ))}
        </StyledStepsContainer>
      </StyledCenter>
    </PageContainer>
  );
};

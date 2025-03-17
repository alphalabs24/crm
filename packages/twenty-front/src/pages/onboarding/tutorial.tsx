import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconCircleCheck, IconCircleDashed } from 'twenty-ui';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${({ theme }) => theme.spacing(140)};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  text-align: center;
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
  width: 100%;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledStepCard = styled(motion.div)<{ $isCompleted: boolean }>`
  display: flex;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  border-left: ${({ theme, $isCompleted }) =>
    $isCompleted
      ? `${theme.spacing(1)} solid ${theme.color.green}`
      : `${theme.spacing(1)} solid ${theme.color.blue}`};
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
    transform: translateY(-${({ theme }) => theme.spacing(0.5)});
  }
`;

const StyledIconContainer = styled.div<{ $isCompleted: boolean }>`
  align-items: center;
  color: ${({ theme, $isCompleted }) =>
    $isCompleted ? theme.color.green : theme.color.blue};
  display: flex;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(3)};
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

  const completedSteps = Object.values(steps).filter(
    (step) => step.completed,
  ).length;
  const totalSteps = Object.keys(steps).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <StyledPageContainer>
      <StyledHeader>
        <StyledTitle>First Steps on Nestermind</StyledTitle>
        <StyledSubtitle>
          Complete these steps to get started with Nestermind and make the most
          of your CRM experience.
        </StyledSubtitle>
      </StyledHeader>

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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
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
                {step.completed ? 'Completed' : 'In progress'}
              </StyledStepStatus>
            </StyledStepContent>
          </StyledStepCard>
        ))}
      </StyledStepsContainer>
    </StyledPageContainer>
  );
};

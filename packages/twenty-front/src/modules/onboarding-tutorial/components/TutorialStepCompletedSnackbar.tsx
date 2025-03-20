import { TUTORIAL_ONBOARDING_STEPS } from '@/onboarding-tutorial/constants/onboarding-steps';
import { useKeyValueStore } from '@/onboarding/hooks/useKeyValueStore';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { UserTutorialExplanation, UserTutorialTask } from 'twenty-shared';

const StyledSnackbarContainer = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(4)};
  left: ${({ theme }) => theme.spacing(4)};
  width: 280px;
  z-index: 9999;
`;

const StyledOnboardingStepsContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  color: ${({ theme }) => theme.font.color.tertiary};
  user-select: none;
`;

const StyledOnboardingTitle = styled(motion.div)`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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

const StyledProgressBar = styled(motion.div)<{ $isCompleted: boolean }>`
  background-color: ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  flex: 1;
  height: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  position: relative;
`;

const StyledProgressBarFill = styled(motion.div)`
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
`;

type TutorialStepCompletedSnackbarProps = {
  step: UserTutorialTask | UserTutorialExplanation;
  onComplete: () => void;
};

export const TutorialStepCompletedSnackbar = ({
  step,
  onComplete,
}: TutorialStepCompletedSnackbarProps) => {
  const { getValueByKey } = useKeyValueStore();
  const stepData = TUTORIAL_ONBOARDING_STEPS.find((s) => s.id === step);
  const totalSteps = TUTORIAL_ONBOARDING_STEPS.length;
  const currentStepIndex = TUTORIAL_ONBOARDING_STEPS.findIndex(
    (s) => s.id === step,
  );

  if (!stepData) return null;

  const isStepCompleted = (
    stepId: UserTutorialTask | UserTutorialExplanation,
  ) => {
    return getValueByKey(stepId) === true;
  };

  return (
    <StyledSnackbarContainer
      initial={{ opacity: 0, x: -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: -20, y: 20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      }}
    >
      <StyledOnboardingStepsContainer>
        <StyledProgressContainer
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.15,
            ease: 'easeInOut',
          }}
          onAnimationComplete={() => {
            setTimeout(() => {
              onComplete();
            }, 5000);
          }}
        >
          <StyledOnboardingTitle>
            {stepData.successMessage}
          </StyledOnboardingTitle>
          <StyledProgressIndicators>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <StyledProgressBar
                key={index}
                $isCompleted={
                  isStepCompleted(TUTORIAL_ONBOARDING_STEPS[index].id) &&
                  index !== currentStepIndex
                }
              >
                {isStepCompleted(TUTORIAL_ONBOARDING_STEPS[index].id) &&
                  index !== currentStepIndex && (
                    <StyledProgressBarFill
                      initial={false}
                      animate={{ width: '100%' }}
                    />
                  )}
                {index === currentStepIndex && (
                  <StyledProgressBarFill
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: 0.6,
                      delay: 1.5,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </StyledProgressBar>
            ))}
          </StyledProgressIndicators>
        </StyledProgressContainer>
      </StyledOnboardingStepsContainer>
    </StyledSnackbarContainer>
  );
};

import { TUTORIAL_ONBOARDING_STEPS } from '@/onboarding-tutorial/constants/onboarding-steps';
import { useKeyValueStore } from '@/onboarding/hooks/useKeyValueStore';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion, useAnimation } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { UserTutorialExplanation, UserTutorialTask } from 'twenty-shared';

const StyledSnackbarContainer = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(4)};
  left: ${({ theme }) => theme.spacing(4)};
  width: 280px;
  z-index: 9999;
`;

const StyledConfettiContainer = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(26)};
  left: ${({ theme }) => theme.spacing(36)};
  pointer-events: none;
  z-index: 100000;
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
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(2)};
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
  background-color: ${({ theme, $isCompleted }) =>
    $isCompleted ? theme.color.blue : theme.background.quaternary};
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
  const theme = useTheme();
  const { getValueByKey } = useKeyValueStore();
  const stepData = TUTORIAL_ONBOARDING_STEPS.find((s) => s.id === step);
  const totalSteps = TUTORIAL_ONBOARDING_STEPS.length;

  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleFillComplete = useCallback(() => {
    setShowConfetti(true);
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.4, ease: 'easeInOut' },
    });
    setTimeout(() => {
      setShowConfetti(false);
      onComplete();
    }, 2000);
  }, [controls, onComplete]);

  useEffect(() => {
    return () => setShowConfetti(false);
  }, []);

  const isStepCompleted = useCallback(
    (stepId: UserTutorialTask | UserTutorialExplanation) => {
      return getValueByKey(stepId) === true;
    },
    [getValueByKey],
  );

  const completedCount = useMemo(() => {
    return TUTORIAL_ONBOARDING_STEPS.filter((s) => isStepCompleted(s.id))
      .length;
  }, [isStepCompleted]);

  if (!stepData) return null;

  return (
    <>
      {showConfetti && (
        <StyledConfettiContainer>
          <ConfettiExplosion
            force={0.2}
            duration={1500}
            particleCount={35}
            width={300}
            height={300}
            particleSize={5}
            colors={[
              theme.color.blue40,
              theme.color.blue50,
              theme.color.blue60,
            ]}
          />
        </StyledConfettiContainer>
      )}
      <StyledSnackbarContainer
        ref={containerRef}
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
        <StyledOnboardingStepsContainer animate={controls}>
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
          >
            <StyledOnboardingTitle>
              {stepData.successMessage}
            </StyledOnboardingTitle>
            <StyledProgressIndicators>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <StyledProgressBar
                  key={index}
                  $isCompleted={index < completedCount - 1}
                >
                  {index === completedCount - 1 && (
                    <StyledProgressBarFill
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: 0.6,
                        delay: 1.5,
                        ease: 'easeOut',
                      }}
                      onAnimationComplete={handleFillComplete}
                    />
                  )}
                </StyledProgressBar>
              ))}
            </StyledProgressIndicators>
          </StyledProgressContainer>
        </StyledOnboardingStepsContainer>
      </StyledSnackbarContainer>
    </>
  );
};

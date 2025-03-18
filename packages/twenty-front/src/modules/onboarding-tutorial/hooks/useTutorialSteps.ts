import {
  TUTORIAL_ONBOARDING_STEPS,
  TutorialOnboardingStepData,
} from '@/onboarding-tutorial/constants/onboarding-steps';
import { useTutorial } from '@/onboarding-tutorial/contexts/TutorialProvider';
import { useKeyValueStore } from '@/onboarding/hooks/useKeyValueStore';
import { useMemo } from 'react';
import { UserTutorialTask } from 'twenty-shared';

type TutorialStep = {
  // static step data
  step: TutorialOnboardingStepData;
  // dynamic step data
  completed: boolean;
  action: () => void;
};

type TutorialSteps = Record<UserTutorialTask, TutorialStep>;

type TutorialStepsType = {
  steps: TutorialSteps;
  setAsCompleted: (step: UserTutorialTask) => void;
};

export const useTutorialSteps = (): TutorialStepsType => {
  const keyValueStore = useKeyValueStore();
  const { showTutorial } = useTutorial();

  // TODO: create a recoil state that caches this more efficiently
  const steps: TutorialSteps = useMemo(() => {
    return TUTORIAL_ONBOARDING_STEPS.reduce(
      (acc, step) => ({
        ...acc,
        [step.id]: {
          step,
          action: () => showTutorial(step.id),
          completed: keyValueStore.getValueByKey(step.id) || false,
        },
      }),
      {} as TutorialSteps,
    );
  }, [keyValueStore, showTutorial]);

  return {
    steps,
    setAsCompleted: (step: UserTutorialTask) => {
      keyValueStore.setValueByKey(step, true);
    },
  };
};

import {
  TUTORIAL_ONBOARDING_STEPS,
  TutorialOnboardingStepData,
} from '@/onboarding-tutorial/constants/onboarding-steps';
import { TutorialStatus } from '@/onboarding-tutorial/types/tutorialStatus';
import { useKeyValueStore } from '@/onboarding/hooks/useKeyValueStore';
import { useMemo } from 'react';

type TutorialStep = {
  // static step data
  step: TutorialOnboardingStepData;
  // dynamic step data
  completed: boolean;
};

type TutorialSteps = Record<TutorialStatus, TutorialStep>;

type TutorialStepsType = {
  steps: TutorialSteps;
  setAsCompleted: (step: TutorialStatus) => void;
};

export const useTutorialSteps = (): TutorialStepsType => {
  const keyValueStore = useKeyValueStore();

  // TODO: create a recoil state that caches this more efficiently
  const steps: TutorialSteps = useMemo(() => {
    return TUTORIAL_ONBOARDING_STEPS.reduce(
      (acc, step) => ({
        ...acc,
        [step.id]: {
          step,
          completed:
            // TODO remove this dummy state
            step.id === TutorialStatus.TUTORIAL_PLATFORM_SETUP
              ? true
              : keyValueStore.getValueByKey(step.id) || false,
        },
      }),
      {} as TutorialSteps,
    );
  }, [keyValueStore]);

  return {
    steps,
    setAsCompleted: (step: TutorialStatus) => {
      keyValueStore.setValueByKey(step, true);
    },
  };
};

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
  setAsCompleted: ({
    step,
    objectNameSingular,
  }: {
    step?: UserTutorialTask;
    objectNameSingular?: CoreObjectNameSingular;
  }) => void;
};

const mapSingularToStep = (objectNameSingular?: CoreObjectNameSingular) => {
  switch (objectNameSingular) {
    case CoreObjectNameSingular.Property:
      return UserTutorialTask.TUTORIAL_PROPERTY;
    case CoreObjectNameSingular.Publication:
      return UserTutorialTask.TUTORIAL_PUBLICATION;
    case CoreObjectNameSingular.Agency:
      return UserTutorialTask.TUTORIAL_PLATFORM_SETUP;
    default:
      return undefined;
  }
};

export const useTutorialSteps = (): TutorialStepsType => {
  const keyValueStore = useKeyValueStore();
  const { showTutorial } = useTutorial();
  // reload current user to get the latest onboarding status

  const steps: TutorialSteps = useMemo(() => {
    return TUTORIAL_ONBOARDING_STEPS.filter((step) => !step.hidden).reduce(
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
    setAsCompleted: async ({
      step,
      objectNameSingular,
    }: {
      step?: UserTutorialTask;
      objectNameSingular?: CoreObjectNameSingular;
    }) => {
      const stepToComplete = step || mapSingularToStep(objectNameSingular);

      if (stepToComplete) {
        try {
          await keyValueStore.setValueByKey(stepToComplete, true);
        } catch (error) {
          console.error(
            'Error setting step as completed for step: ',
            stepToComplete,
            error,
          );
        }
      }
    },
  };
};

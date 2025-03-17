import { TutorialStatus } from '@/onboarding-tutorial/types/tutorialStatus';
import { Trans } from '@lingui/react/macro';
import { ReactElement, ReactNode } from 'react';
import {
  IconAbc,
  IconCheck,
  IconHome,
  IconHomeShare,
  IconMail,
  TablerIconsProps,
} from 'twenty-ui';

export type TutorialOnboardingStepData = {
  id: TutorialStatus;
  title: string | ReactNode;
  description: string | ReactNode;
  Icon: (props: TablerIconsProps) => ReactElement;
};

// These are the visible steps in the onboarding tutorial component
export const TUTORIAL_ONBOARDING_STEPS: TutorialOnboardingStepData[] = [
  {
    id: TutorialStatus.TUTORIAL_PLATFORM_SETUP,
    title: <Trans>Setup your platform credentials</Trans>,
    description: <Trans>Setup your platform credentials</Trans>,
    Icon: IconAbc,
  },
  {
    id: TutorialStatus.TUTORIAL_EMAIL,
    title: <Trans>Connect your email</Trans>,
    description: <Trans>Connect your email</Trans>,
    Icon: IconMail,
  },
  {
    id: TutorialStatus.TUTORIAL_PROPERTY,
    title: <Trans>Create your first property</Trans>,
    description: <Trans>Create your first property</Trans>,
    Icon: IconHome,
  },
  {
    id: TutorialStatus.TUTORIAL_PUBLICATION,
    title: <Trans>Create your first publication</Trans>,
    description: <Trans>Create your first publication</Trans>,
    Icon: IconHomeShare,
  },
  {
    id: TutorialStatus.TUTORIAL_COMPLETED,
    title: <Trans>Completed all steps</Trans>,
    description: <Trans>Completed all steps</Trans>,
    Icon: IconCheck,
  },
];

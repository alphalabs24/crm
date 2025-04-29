import { Trans } from '@lingui/react/macro';
import { ReactElement, ReactNode } from 'react';
import { UserTutorialTask } from 'twenty-shared';
import {
  IconAbc,
  IconHome,
  IconHomeShare,
  IconMail,
  TablerIconsProps,
} from 'twenty-ui';

export type TutorialOnboardingStepData = {
  id: UserTutorialTask;
  title: string | ReactNode;
  description: string | ReactNode;
  successMessage: string | ReactNode;
  Icon: (props: TablerIconsProps) => ReactElement;
  hidden?: boolean;
  requires?: UserTutorialTask[];
};

// These are the visible steps in the onboarding tutorial component
export const TUTORIAL_ONBOARDING_STEPS: TutorialOnboardingStepData[] = [
  {
    id: UserTutorialTask.TUTORIAL_PLATFORM_SETUP,
    title: <Trans>Setup your platform credentials</Trans>,
    description: (
      <Trans>
        Setup your platform credentials in order to publish your properties.
      </Trans>
    ),
    successMessage: <Trans>Platform credentials setup successfully</Trans>,
    Icon: IconAbc,
  },
  {
    id: UserTutorialTask.TUTORIAL_EMAIL,
    title: <Trans>Connect your email</Trans>,
    description: (
      <Trans>
        Connect your email in order to synchronize your inbox with nestermind.
      </Trans>
    ),
    successMessage: <Trans>Email connected successfully</Trans>,
    Icon: IconMail,
  },
  {
    id: UserTutorialTask.TUTORIAL_PROPERTY,
    title: <Trans>Create your first property</Trans>,
    description: (
      <Trans>
        A property in nestermind holds the master data about a property you want
        to publish.
      </Trans>
    ),
    successMessage: <Trans>Property created successfully</Trans>,
    Icon: IconHome,
  },
  {
    id: UserTutorialTask.TUTORIAL_PUBLICATION,
    title: <Trans>Publish your first property</Trans>,
    description: (
      <Trans>Create a publication draft and publish it to a platform.</Trans>
    ),
    successMessage: <Trans>Publication created successfully</Trans>,
    Icon: IconHomeShare,
    requires: [UserTutorialTask.TUTORIAL_PROPERTY],
  },
];

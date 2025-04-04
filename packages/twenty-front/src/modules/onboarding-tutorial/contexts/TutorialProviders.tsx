import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { TutorialProvider } from '@/onboarding-tutorial/contexts/TutorialProvider';
import { TutorialSnackbarProvider } from '@/onboarding-tutorial/contexts/TutorialSnackbarProvider';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

type TutorialProvidersProps = {
  children: React.ReactNode;
};

export const TutorialProviders = ({ children }: TutorialProvidersProps) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const isNonNestermindWorkspaceEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsNonNestermindWorkspaceEnabled,
  );
  // This way we don't run into issues with undefined metadata
  if (!currentWorkspaceMembers.length || isNonNestermindWorkspaceEnabled)
    return children;
  return (
    <TutorialSnackbarProvider>
      <TutorialProvider>{children}</TutorialProvider>
    </TutorialSnackbarProvider>
  );
};

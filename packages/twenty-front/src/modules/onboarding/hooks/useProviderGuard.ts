import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

// Handles undefined workspace members or non-nestermind workspaces
export const useProviderGuard = () => {
  const isNonNestermindWorkspaceEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsNonNestermindWorkspaceEnabled,
  );
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  return isNonNestermindWorkspaceEnabled || !currentWorkspaceMembers.length;
};

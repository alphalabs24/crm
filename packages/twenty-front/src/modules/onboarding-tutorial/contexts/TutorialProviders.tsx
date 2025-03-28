import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { TutorialProvider } from '@/onboarding-tutorial/contexts/TutorialProvider';
import { TutorialSnackbarProvider } from '@/onboarding-tutorial/contexts/TutorialSnackbarProvider';
import { useRecoilValue } from 'recoil';

type TutorialProvidersProps = {
  children: React.ReactNode;
};

export const TutorialProviders = ({ children }: TutorialProvidersProps) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  // This way we don't run into issues with undefined metadata
  if (!currentWorkspaceMembers.length) return children;
  return (
    <TutorialSnackbarProvider>
      <TutorialProvider>{children}</TutorialProvider>
    </TutorialSnackbarProvider>
  );
};

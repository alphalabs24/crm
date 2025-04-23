import { TutorialProvider } from '@/onboarding-tutorial/contexts/TutorialProvider';
import { TutorialSnackbarProvider } from '@/onboarding-tutorial/contexts/TutorialSnackbarProvider';
import { useProviderGuard } from '@/onboarding/hooks/useProviderGuard';

type TutorialProvidersProps = {
  children: React.ReactNode;
};

export const TutorialProviders = ({ children }: TutorialProvidersProps) => {
  const blockProvider = useProviderGuard();
  // This way we don't run into issues with undefined metadata
  if (blockProvider) return children;
  return (
    <TutorialSnackbarProvider>
      <TutorialProvider>{children}</TutorialProvider>
    </TutorialSnackbarProvider>
  );
};

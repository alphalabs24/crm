import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';

export const Tutorial = () => {
  const { steps } = useTutorialSteps();

  return <PageContainer></PageContainer>;
};

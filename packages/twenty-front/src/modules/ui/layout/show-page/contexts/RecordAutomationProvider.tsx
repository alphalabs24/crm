import { useProviderGuard } from '@/onboarding/hooks/useProviderGuard';
import { AppPath } from '@/types/AppPath';
import { AutoSetAgencyEffect } from '@/ui/layout/show-page/components/nm/effects/AutoSetAgencyEffect';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const RecordAutomationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const blockProvider = useProviderGuard();

  const { isMatchingLocation } = useIsMatchingLocation();

  const isPropertyShowPage = isMatchingLocation(AppPath.RecordShowPropertyPage);

  if (!isPropertyShowPage || blockProvider) return children;

  return (
    <>
      <AutoSetAgencyEffect />
      {children}
    </>
  );
};

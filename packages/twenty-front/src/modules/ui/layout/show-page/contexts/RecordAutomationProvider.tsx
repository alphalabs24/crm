import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { AppPath } from '@/types/AppPath';
import { AutoSetAgencyEffect } from '@/ui/layout/show-page/components/nm/effects/AutoSetAgencyEffect';
import { useRecoilValue } from 'recoil';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const RecordAutomationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  const { isMatchingLocation } = useIsMatchingLocation();

  const isPropertyShowPage = isMatchingLocation(AppPath.RecordShowPropertyPage);

  if (!currentWorkspaceMembers || !isPropertyShowPage) return children;

  return (
    <>
      <AutoSetAgencyEffect />
      {children}
    </>
  );
};

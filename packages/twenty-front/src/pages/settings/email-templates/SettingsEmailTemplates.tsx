import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { useRecoilValue } from 'recoil';
import { SettingsEmailTemplatesContent } from '~/pages/settings/email-templates/components/SettingsEmailTemplatesContent';

export const SettingsEmailTemplates = () => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  // This way we don't run into issues with undefined metadata
  if (!currentWorkspaceMembers.length) return null;

  return <SettingsEmailTemplatesContent />;
};

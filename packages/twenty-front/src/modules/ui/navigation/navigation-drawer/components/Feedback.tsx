import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { cannyAppIdState } from '@/client-config/states/cannyAppIdState';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconExternalLink } from 'twenty-ui';
import { useEffect, useMemo, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isNavigationDrawerExpandedState } from '../../states/isNavigationDrawerExpanded';

const StyledFeedbackLink = styled.a`
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: 4px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.secondary};
  padding: 4px 8px;
  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

declare global {
  interface Window {
    Canny: any;
  }
}

export const Feedback = () => {
  const [currentWorkspaceMember] = useRecoilState(currentWorkspaceMemberState);
  const [currentWorkspace] = useRecoilState(currentWorkspaceState);
  const cannyAppId = useRecoilValue(cannyAppIdState);
  const [identified, setIdentified] = useState(false);
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  const { i18n } = useLingui();

  useEffect(() => {
    if (currentWorkspaceMember && cannyAppId && !identified) {
      // Initialize Canny SDK
      if (typeof window.Canny === 'function') {
        window.Canny('identify', {
          appID: cannyAppId,
          user: {
            email: (currentWorkspaceMember as any).userEmail ?? '',
            name: `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`,
            id: currentWorkspaceMember.id,
            avatarURL: currentWorkspaceMember.avatarUrl,
            created: new Date().toISOString(), // Since we don't have created date, using current date
            language: i18n.locale, // Add the current locale
            companies: [
              {
                name: currentWorkspace?.displayName ?? '',
                id: currentWorkspace?.id ?? '',
              },
            ],
          },
        });
      }
      setIdentified(true);
    }
  }, [
    currentWorkspaceMember,
    cannyAppId,
    i18n.locale,
    currentWorkspace?.displayName,
    currentWorkspace?.id,
    identified,
  ]);

  if (!isNavigationDrawerExpanded) {
    return null;
  }

  return (
    <StyledFeedbackLink href="https://nestermind.canny.io" target="_blank">
      <Trans>Give us feedback</Trans>
      <IconExternalLink size={14} />
    </StyledFeedbackLink>
  );
};

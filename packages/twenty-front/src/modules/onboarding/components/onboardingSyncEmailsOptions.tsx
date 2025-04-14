import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';

import { MessageChannelVisibility } from '~/generated/graphql';

const StyledCardMedia = styled(SettingsAccountsVisibilityIcon)`
  width: ${({ theme }) => theme.spacing(10)};
`;

export const onboardingSyncEmailsOptions = [
  {
    title: <Trans>Everything</Trans>,
    description: (
      <Trans>
        Your emails and events content will be shared with your team.
      </Trans>
    ),
    value: MessageChannelVisibility.SHARE_EVERYTHING,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="active" />
    ),
  },
  {
    title: <Trans>Subject and metadata</Trans>,
    description: (
      <Trans>
        Your email subjects and meeting titles will be shared with your team.
      </Trans>
    ),
    value: MessageChannelVisibility.SUBJECT,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="inactive" />
    ),
  },
  {
    title: <Trans>Metadata</Trans>,
    description: (
      <Trans>
        Only the timestamp & participants will be shared with your team.
      </Trans>
    ),
    value: MessageChannelVisibility.METADATA,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="inactive" body="inactive" />
    ),
  },
];

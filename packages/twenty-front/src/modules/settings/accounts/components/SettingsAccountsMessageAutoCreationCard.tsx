import { MessageChannelContactAutoCreationPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageAutoCreationIcon } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationIcon';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { useLingui } from '@lingui/react/macro';

type SettingsAccountsMessageAutoCreationCardProps = {
  onChange: (nextValue: MessageChannelContactAutoCreationPolicy) => void;
  value?: MessageChannelContactAutoCreationPolicy;
};

export const SettingsAccountsMessageAutoCreationCard = ({
  onChange,
  value = MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
}: SettingsAccountsMessageAutoCreationCardProps) => {
  const { t } = useLingui();
  const autoCreationOptions = [
    {
      title: t`Sent and Received`,
      description: t`People I’ve sent emails to and received emails from.`,
      value: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
      cardMedia: (
        <SettingsAccountsMessageAutoCreationIcon
          isSentActive
          isReceivedActive
        />
      ),
    },
    {
      title: t`Sent`,
      description: t`People I’ve sent emails to.`,
      value: MessageChannelContactAutoCreationPolicy.SENT,
      cardMedia: <SettingsAccountsMessageAutoCreationIcon isSentActive />,
    },
    {
      title: t`None`,
      description: t`Don’t auto-create contacts.`,
      value: MessageChannelContactAutoCreationPolicy.NONE,
      cardMedia: (
        <SettingsAccountsMessageAutoCreationIcon
          isSentActive={false}
          isReceivedActive={false}
        />
      ),
    },
  ];

  return (
    <SettingsAccountsRadioSettingsCard
      name="message-auto-creation"
      options={autoCreationOptions}
      value={value}
      onChange={onChange}
    />
  );
};

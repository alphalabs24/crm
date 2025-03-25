import styled from '@emotion/styled';

import { EmailFormRichTextEditor } from '@/activities/components/EmailFormRichTextEditor';
import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { useUnsavedChanges } from '@/record-edit/contexts/UnsavedChangesContext';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconSend } from 'twenty-ui';
import { EmailTemplateSelect } from '~/pages/settings/email-templates/components/EmailTemplateSelect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  position: relative;
`;

const StyledEmailPreviewContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledTestEmailContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const PropertyEmailsFormInput = ({ loading }: { loading?: boolean }) => {
  const { setEmailTemplate, emailTemplate, isDirty, saveRecord } =
    useRecordEdit();
  const { openActionModal } = useUnsavedChanges();
  const { objectRecordId, objectNameSingular } = useParams();
  const [testEmail, setTestEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { t } = useLingui();

  const { publicationsApi, propertiesApi } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();

  const handleEmailChange = useCallback(
    (value: string) => {
      setTestEmail(value);
      if (value && !emailSchema.safeParse(value).success) {
        setEmailError(t`Please enter a valid email address`);
      } else {
        setEmailError('');
      }
    },
    [t],
  );

  const sendTestEmail = async () => {
    try {
      setIsSending(true);
      if (objectNameSingular === CoreObjectNameSingular.Property) {
        await propertiesApi.sendTestEmail({
          propertyId: objectRecordId ?? '',
          toEmail: testEmail,
        });
      } else {
        await publicationsApi.sendTestEmail({
          publicationId: objectRecordId ?? '',
          toEmail: testEmail,
        });
      }

      enqueueSnackBar(t`Test email sent successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(t`Failed to send test email`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !emailSchema.safeParse(testEmail).success) {
      setEmailError(t`Please enter a valid email address`);
      return;
    }

    if (isDirty) {
      openActionModal({
        title: t`Unsaved Changes`,
        message: t`You have unsaved changes. Please save before sending the test email.`,
        actions: [
          {
            label: t`Save and send`,
            onClick: async () => {
              await saveRecord();
              await sendTestEmail();
            },
            variant: 'secondary',
            accent: 'blue',
            disabled: isSending,
          },
        ],
      });
    } else {
      await sendTestEmail();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && testEmail && !emailError && !isSending) {
      handleSendTestEmail();
    }
  };

  if (loading) {
    return null; // TODO: Add loading state
  }

  return (
    <StyledContainer>
      <EmailTemplateSelect
        selectedTemplateId={emailTemplate?.id}
        onSelect={setEmailTemplate}
      />
      {emailTemplate && (
        <>
          <StyledTestEmailContainer>
            <TextInputV2
              value={testEmail}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDown}
              placeholder={t`Enter test email address`}
              error={emailError}
              fullWidth
              disabled={isSending}
            />
            <Button
              Icon={IconSend}
              title={t`Send Test`}
              variant="secondary"
              onClick={handleSendTestEmail}
              disabled={!testEmail || !!emailError || isSending}
            />
          </StyledTestEmailContainer>
          <StyledEmailPreviewContainer>
            <EmailFormRichTextEditor
              activityToSet={emailTemplate}
              activityObjectNameSingular={CoreObjectNameSingular.Note}
              activityId={emailTemplate.id}
              isReadOnly
            />
          </StyledEmailPreviewContainer>
        </>
      )}
    </StyledContainer>
  );
};

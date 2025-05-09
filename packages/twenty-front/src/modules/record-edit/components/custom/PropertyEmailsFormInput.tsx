import styled from '@emotion/styled';

import { EmailFormRichTextEditor } from '@/activities/components/EmailFormRichTextEditor';
import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { useUnsavedChanges } from '@/record-edit/contexts/UnsavedChangesContext';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Alert } from '~/ui/feedback/alert/components/Alert';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconBolt, IconSend } from 'twenty-ui';
import { EmailTemplateSelect } from '~/pages/settings/email-templates/components/EmailTemplateSelect';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';

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

const FLYER_TAG = '{{link_to_flyer}}';
const DOCUMENTATION_TAG = '{{link_to_documentation}}';

export const PropertyEmailsFormInput = ({ loading }: { loading?: boolean }) => {
  const {
    setEmailTemplate,
    emailTemplate,
    isDirty,
    saveRecord,
    initialRecord,
  } = useRecordEdit();
  const { openActionModal } = useUnsavedChanges();
  const { objectRecordId, objectNameSingular } = useParams();
  const [testEmail, setTestEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { t } = useLingui();

  const { attachments, loading: attachmentsLoading } = useAttachments({
    id: objectRecordId ?? '',
    targetObjectNameSingular: objectNameSingular ?? '',
  });

  const propertyDocumentation = attachments?.find(
    (attachment) => attachment.type === 'PropertyDocumentation',
  );

  const propertyFlyer = attachments?.find(
    (attachment) => attachment.type === 'PropertyFlyer',
  );

  const hasNoFlyerButReferencesFlyer = useMemo(() => {
    if (attachmentsLoading) return false;
    return (
      emailTemplate?.bodyV2?.blocknote?.includes(FLYER_TAG) && !propertyFlyer
    );
  }, [attachmentsLoading, emailTemplate?.bodyV2?.blocknote, propertyFlyer]);

  const hasNoDocumentationButReferencesDocumentation = useMemo(() => {
    if (attachmentsLoading) return false;
    return (
      emailTemplate?.bodyV2?.blocknote?.includes(DOCUMENTATION_TAG) &&
      !propertyDocumentation
    );
  }, [
    attachmentsLoading,
    emailTemplate?.bodyV2?.blocknote,
    propertyDocumentation,
  ]);

  const getMissingDocumentsAlertTitle = useMemo(() => {
    if (
      hasNoFlyerButReferencesFlyer &&
      hasNoDocumentationButReferencesDocumentation
    ) {
      return t`Missing flyer and documentation`;
    }
    if (hasNoFlyerButReferencesFlyer) {
      return t`Missing flyer`;
    }
    if (hasNoDocumentationButReferencesDocumentation) {
      return t`Missing documentation`;
    }
    return '';
  }, [
    hasNoFlyerButReferencesFlyer,
    hasNoDocumentationButReferencesDocumentation,
    t,
  ]);

  const getMissingDocumentsAlertContent = useMemo(() => {
    if (
      hasNoFlyerButReferencesFlyer &&
      hasNoDocumentationButReferencesDocumentation
    ) {
      return t`This template references a flyer and documentation, but neither has been uploaded for this property.`;
    }
    if (hasNoFlyerButReferencesFlyer) {
      return t`This template references a flyer, but none has been uploaded for this property.`;
    }
    if (hasNoDocumentationButReferencesDocumentation) {
      return t`This template references documentation, but none has been uploaded for this property.`;
    }
    return '';
  }, [
    hasNoFlyerButReferencesFlyer,
    hasNoDocumentationButReferencesDocumentation,
    t,
  ]);

  const { useMutations } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();

  // Use mutation hooks
  const { mutate: sendTestEmailPublication, isPending: isSendingPublication } =
    useMutations.useSendTestEmailPublication({
      onSuccess: () => {
        enqueueSnackBar(t`Test email sent successfully`, {
          variant: SnackBarVariant.Success,
        });
      },
      onError: () => {
        enqueueSnackBar(t`Failed to send test email`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const { mutate: sendTestEmailProperty, isPending: isSendingProperty } =
    useMutations.useSendTestEmailProperty({
      onSuccess: () => {
        enqueueSnackBar(t`Test email sent successfully`, {
          variant: SnackBarVariant.Success,
        });
      },
      onError: () => {
        enqueueSnackBar(t`Failed to send test email`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const isSending = isSendingPublication || isSendingProperty;

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
    if (objectNameSingular === CoreObjectNameSingular.Property) {
      sendTestEmailProperty({
        propertyId: objectRecordId ?? '',
        toEmail: testEmail,
      });
    } else {
      sendTestEmailPublication({
        publicationId: objectRecordId ?? '',
        toEmail: testEmail,
      });
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
              const error = await saveRecord();
              if (error) {
                enqueueSnackBar(t`Failed to save changes`, {
                  variant: SnackBarVariant.Error,
                });
              } else {
                sendTestEmail();
              }
            },
            variant: 'secondary',
            accent: 'blue',
            disabled: isSending,
          },
        ],
      });
    } else {
      sendTestEmail();
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
          {(hasNoFlyerButReferencesFlyer ||
            hasNoDocumentationButReferencesDocumentation) && (
            <Alert
              type="warning"
              title={getMissingDocumentsAlertTitle}
              linkTo={
                objectNameSingular && initialRecord
                  ? `${getLinkToShowPage(objectNameSingular, initialRecord)}#marketingSuite`
                  : undefined
              }
              linkText={
                hasNoFlyerButReferencesFlyer &&
                hasNoDocumentationButReferencesDocumentation
                  ? t`Generate documents`
                  : hasNoFlyerButReferencesFlyer
                    ? t`Generate flyer`
                    : t`Generate documentation`
              }
              LinkIcon={IconBolt}
            >
              {getMissingDocumentsAlertContent}
            </Alert>
          )}
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
              key={emailTemplate.id}
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

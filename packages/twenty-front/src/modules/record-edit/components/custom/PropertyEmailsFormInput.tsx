import styled from '@emotion/styled';

import { useEmailTemplateContextOrThrow } from '@/record-edit/contexts/EmailTemplateContext';
import { ActivityRichTextEditor } from '@/activities/components/ActivityRichTextEditor';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { EmailTemplateSetDefaultValuesEffect } from '../EmailTemplateSetDefaultValuesEffect';
import { Trans, useLingui } from '@lingui/react/macro';
import { EmailFormRichTextEditor } from '@/activities/components/EmailFormRichTextEditor';
import { Button } from '@ui/input/button/components/Button';
import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { v4 } from 'uuid';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  position: relative;
`;

const StyledEmailEntryContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledEmailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PropertyEmailsFormInput = ({ loading }: { loading?: boolean }) => {
  const { emailTemplateId, emailTemplate, propertyId, publicationId } =
    useEmailTemplateContextOrThrow();

  const { emailTemplateSubject, updateEmailTemplateSubject } = useRecordEdit();

  const { createOneRecord, loading: loadingCreation } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const { updateOneRecord: updatePropertyEmailTemplate } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const { updateOneRecord: updatePublicationEmailTemplate } =
    useUpdateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Publication,
    });

  const createEmailTemplate = async () => {
    const newRecordId = v4();
    const createRecordPayload: {
      id: string;
      title: string;
      [key: string]: any;
    } = {
      id: newRecordId,
      title: '',
    };

    await createOneRecord(createRecordPayload);

    if (propertyId) {
      await updatePropertyEmailTemplate({
        idToUpdate: propertyId,
        updateOneRecordInput: {
          emailTemplateId: newRecordId,
        },
      });
    }

    if (publicationId) {
      await updatePublicationEmailTemplate({
        idToUpdate: publicationId,
        updateOneRecordInput: {
          emailTemplateId: newRecordId,
        },
      });
    }
  };

  if (loading) {
    // TODO: Add loading state
    return null;
  }
  return (
    <>
      <EmailTemplateSetDefaultValuesEffect />
      <StyledContainer>
        <StyledTitle>
          <Trans>Email Template</Trans>
        </StyledTitle>
        {emailTemplateId ? (
          <>
            <TextInputV2
              label="Subject"
              value={emailTemplateSubject}
              onChange={(text) => updateEmailTemplateSubject(text)}
            />
            <StyledEmailBody>
              <StyledEmailEntryContainer>
                <EmailFormRichTextEditor
                  showPlaceholderButtonBar
                  activityToSet={emailTemplate}
                  activityObjectNameSingular={CoreObjectNameSingular.Note}
                  activityId={emailTemplateId}
                />
              </StyledEmailEntryContainer>
            </StyledEmailBody>
          </>
        ) : (
          <div>
            <Button
              title="Create Email Template"
              onClick={createEmailTemplate}
              disabled={loadingCreation}
            />
          </div>
        )}
      </StyledContainer>
    </>
  );
};

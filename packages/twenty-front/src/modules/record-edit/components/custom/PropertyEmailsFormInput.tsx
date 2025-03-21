import styled from '@emotion/styled';

import { EmailFormRichTextEditor } from '@/activities/components/EmailFormRichTextEditor';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
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

const StyledPreviewTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

export const PropertyEmailsFormInput = ({ loading }: { loading?: boolean }) => {
  const { setEmailTemplate, emailTemplate } = useRecordEdit();

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
        <StyledEmailPreviewContainer>
          <EmailFormRichTextEditor
            activityToSet={emailTemplate}
            activityObjectNameSingular={CoreObjectNameSingular.Note}
            activityId={emailTemplate.id}
            isReadOnly
          />
        </StyledEmailPreviewContainer>
      )}
    </StyledContainer>
  );
};

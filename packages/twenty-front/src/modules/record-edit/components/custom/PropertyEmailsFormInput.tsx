import styled from '@emotion/styled';

import { useEmailTemplateContextOrThrow } from '@/record-edit/contexts/EmailTemplateContext';
import { ActivityRichTextEditor } from '@/activities/components/ActivityRichTextEditor';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { EmailTemplateSetDefaultValuesEffect } from '../EmailTemplateSetDefaultValuesEffect';
import { Trans, useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  position: relative;
`;

const StyledEmailEntryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};

  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(8)} 0;
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const PropertyEmailsFormInput = ({ loading }: { loading?: boolean }) => {
  const { emailTemplateId, emailTemplate } = useEmailTemplateContextOrThrow();
  const { emailTemplateSubject, updateEmailTemplateSubject } = useRecordEdit();

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
        <TextInputV2
          label="Subject"
          value={emailTemplateSubject}
          onChange={(text) => updateEmailTemplateSubject(text)}
        />
        <StyledEmailEntryContainer>
          <ActivityRichTextEditor
            activityToSet={emailTemplate}
            activityObjectNameSingular={CoreObjectNameSingular.Note}
            activityId={emailTemplateId}
          />
        </StyledEmailEntryContainer>
      </StyledContainer>
    </>
  );
};

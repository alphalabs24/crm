import { EmailFormRichTextEditor } from '@/activities/components/EmailFormRichTextEditor';
import { Note } from '@/activities/types/Note';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

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

type EmailTemplateFormProps = {
  emailTemplate?: Note | null;
  onUpdate?: (subject: string) => void;
  loading?: boolean;
};

export const EmailTemplateForm = ({
  emailTemplate,
  onUpdate,
  loading,
}: EmailTemplateFormProps) => {
  const { t } = useLingui();
  const [subject, setSubject] = useState('');

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  useEffect(() => {
    if (emailTemplate?.title) {
      setSubject(emailTemplate.title);
    }
  }, [emailTemplate?.title]);

  const debouncedUpdateSubject = useDebouncedCallback(
    (value: string) => {
      onUpdate?.(value);

      if (emailTemplate?.id) {
        updateOneRecord({
          idToUpdate: emailTemplate.id,
          updateOneRecordInput: {
            title: value,
          },
        });
      }
    },
    300,
    { leading: true },
  );

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    debouncedUpdateSubject(value);
  };

  if (loading) {
    return null; // TODO: Add loading state
  }

  return (
    <StyledContainer>
      <TextInputV2
        label={t`Subject`}
        value={subject}
        onChange={handleSubjectChange}
        placeholder={t`Email subject`}
      />
      <StyledEmailEntryContainer>
        <EmailFormRichTextEditor
          showPlaceholderButtonBar
          activityToSet={emailTemplate}
          activityObjectNameSingular={CoreObjectNameSingular.Note}
          activityId={emailTemplate?.id ?? ''}
        />
      </StyledEmailEntryContainer>
    </StyledContainer>
  );
};

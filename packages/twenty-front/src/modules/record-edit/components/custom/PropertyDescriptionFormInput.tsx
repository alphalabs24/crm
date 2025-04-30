import styled from '@emotion/styled';
import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { DescriptionFormRichTextEditor } from '@/activities/components/DescriptionFormRichTextEditor';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useParams } from 'react-router-dom';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StyledEditorContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const PropertyDescriptionFormInput = ({
  loading,
  recordId,
}: {
  loading?: boolean;
  recordId: string;
}) => {
  //const ... useRecordEdit();
  const { objectNameSingular } = useParams();

  const { record } = useFindOneRecord({
    objectNameSingular: objectNameSingular ?? CoreObjectNameSingular.Property,
    objectRecordId: recordId,
  });

  const handleChange = (
    input: { bodyV2: { blocknote: string; markdown: null } } | { body: string },
  ) => {
    // Log changes to console for now
    console.log('Description changed:', input);

    // TODO Update record in the form context
  };

  if (loading) {
    return null; // TODO: Add loading state
  }

  return (
    <StyledContainer>
      <StyledTitle>
        <Trans>Description</Trans>
      </StyledTitle>
      <StyledEditorContainer>
        <DescriptionFormRichTextEditor
          recordId={recordId}
          recordToSet={record}
          onChange={handleChange}
        />
      </StyledEditorContainer>
    </StyledContainer>
  );
};

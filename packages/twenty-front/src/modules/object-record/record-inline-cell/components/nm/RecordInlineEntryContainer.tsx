import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';

import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from '../RecordInlineCellContext';

const StyledValueContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledGridEntryLabelContainer = styled.div`
  flex-shrink: 0;
  min-width: 200px;
  @media only screen and (max-width: ${MOBILE_VIEWPORT}px) {
    min-width: 100px;
  }
`;

const StyledGridEntryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRequiredIndicator = styled.div`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const RecordInlineEntryContainer = ({
  isRequired,
}: {
  isRequired?: boolean;
}) => {
  const { label } = useRecordInlineCellContext();

  const { fieldDefinition } = useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  return (
    <StyledValueContainer>
      <StyledGridEntryLabelContainer>{label}</StyledGridEntryLabelContainer>
      <StyledGridEntryContainer>
        <RecordInlineCellValue />
        {isRequired && (
          <StyledRequiredIndicator>Required</StyledRequiredIndicator>
        )}
      </StyledGridEntryContainer>
    </StyledValueContainer>
  );
};

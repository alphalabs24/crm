import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useTheme } from '@emotion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { DescriptionFormRichTextEditor } from '@/activities/components/DescriptionFormRichTextEditor';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';

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

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const PropertyDescriptionFormInput = ({
  loading,
  recordId,
}: {
  loading?: boolean;
  recordId: string;
}) => {
  const theme = useTheme();
  const { initialRecord, updateField } = useRecordEdit();

  const handleChange = (input: {
    bodyV2: { blocknote: string; markdown: null };
  }) => {
    // Log changes to console for now
    updateField({
      fieldName: 'descriptionV2',
      value: input.bodyV2,
    });
  };

  if (loading) {
    return (
      <StyledContainer>
        <StyledTitle>
          <Trans>Description</Trans>
        </StyledTitle>
        <StyledSkeletonContainer>
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton width="100%" height={280} />
          </SkeletonTheme>
        </StyledSkeletonContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledTitle>
        <Trans>Description</Trans>
      </StyledTitle>
      <StyledEditorContainer>
        <DescriptionFormRichTextEditor
          recordId={recordId}
          recordToSet={initialRecord}
          onChange={handleChange}
        />
      </StyledEditorContainer>
    </StyledContainer>
  );
};

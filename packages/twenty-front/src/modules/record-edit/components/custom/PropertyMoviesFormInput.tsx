import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { useCallback, useMemo } from 'react';

const StyledFieldName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledFieldContainer = styled.div<{ isHorizontal?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: ${({ isHorizontal }) => (isHorizontal ? 1 : 'unset')};
  min-width: ${({ isHorizontal }) => (isHorizontal ? '160px' : 'unset')};
`;

export const PropertyMoviesFormInput = () => {
  const { updateField, initialRecord, getUpdatedFields } = useRecordEdit();

  const value = useMemo(() => {
    const updatedFields = getUpdatedFields();
    const movies = updatedFields?.movies as Array<string>;
    const movie = JSON.parse(movies?.[0] || initialRecord?.movies?.[0] || '{}');
    const filename = movie?.filename;
    return filename || '';
  }, [getUpdatedFields, initialRecord]);

  const updateMovieFilename = useCallback(
    (filename: string) => {
      updateField({
        fieldName: 'movies',
        value: [JSON.stringify({ filename })],
      });
    },
    [updateField],
  );

  return (
    <StyledFieldContainer>
      <StyledFieldName>Movie Link</StyledFieldName>
      <TextInputV2
        placeholder="Enter movie link"
        value={value}
        onChange={updateMovieFilename}
      />
    </StyledFieldContainer>
  );
};

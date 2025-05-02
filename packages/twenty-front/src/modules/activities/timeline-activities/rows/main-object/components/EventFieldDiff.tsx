import styled from '@emotion/styled';

import { EventFieldDiffLabel } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { Trans } from '@lingui/react/macro';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';

type EventFieldDiffProps = {
  diffRecord: Record<string, any>;
  mainObjectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem | undefined;
  diffArtificialRecordStoreId: string;
};

const StyledEventFieldDiffContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyValue = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const EventFieldDiff = ({
  diffRecord,
  mainObjectMetadataItem,
  fieldMetadataItem,
  diffArtificialRecordStoreId,
}: EventFieldDiffProps) => {
  if (!fieldMetadataItem) {
    throw new Error('fieldMetadataItem is required');
  }

  const isValueEmpty = (value: unknown): boolean =>
    value === null || value === undefined || value === '';

  const isObjectEmpty = (obj: Record<string, unknown>): boolean =>
    Object.values(obj).every(isValueEmpty);

  const isUpdatedToEmpty =
    isValueEmpty(diffRecord) ||
    (typeof diffRecord === 'object' &&
      diffRecord !== null &&
      isObjectEmpty(diffRecord));

  return (
    <RecordFieldValueSelectorContextProvider>
      <StyledEventFieldDiffContainer>
        <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
        {isFieldUuid({ type: fieldMetadataItem.type }) ? '' : '→'}
        {isUpdatedToEmpty ? (
          <StyledEmptyValue>
            <Trans>Empty</Trans>
          </StyledEmptyValue>
        ) : (
          <>
            <EventFieldDiffValueEffect
              diffArtificialRecordStoreId={diffArtificialRecordStoreId}
              mainObjectMetadataItem={mainObjectMetadataItem}
              fieldMetadataItem={fieldMetadataItem}
              diffRecord={diffRecord}
            />
            {/* Don't show internal ids */}
            {fieldMetadataItem &&
            isFieldUuid({ type: fieldMetadataItem.type }) ? null : (
              <EventFieldDiffValue
                diffArtificialRecordStoreId={diffArtificialRecordStoreId}
                mainObjectMetadataItem={mainObjectMetadataItem}
                fieldMetadataItem={fieldMetadataItem}
              />
            )}
          </>
        )}
      </StyledEventFieldDiffContainer>
    </RecordFieldValueSelectorContextProvider>
  );
};

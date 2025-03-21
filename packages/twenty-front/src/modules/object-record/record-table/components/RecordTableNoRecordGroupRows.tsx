import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableAggregateFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooter';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';

export const RecordTableNoRecordGroupRows = ({
  readonly,
  objectNameSingular,
}: {
  readonly?: boolean;
  objectNameSingular: string;
}) => {
  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { records } = useFindManyRecords({
    objectNameSingular: objectNameSingular,
  });

  const filteredNoTemplateRecordIds = useMemo(() => {
    if (objectNameSingular !== CoreObjectNameSingular.Note) {
      return allRecordIds;
    }
    return records
      .filter((record) => !record.isTemplate)
      .map((record) => record.id);
  }, [objectNameSingular, records, allRecordIds]);

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
  );

  return (
    <>
      {filteredNoTemplateRecordIds.map((recordId, rowIndex) => {
        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndexForFocus={rowIndex}
            rowIndexForDrag={rowIndex}
            readonly={readonly}
          />
        );
      })}
      <RecordTableBodyFetchMoreLoader />
      {!isRecordTableInitialLoading &&
        filteredNoTemplateRecordIds.length > 0 && (
          <RecordTableAggregateFooter />
        )}
    </>
  );
};

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isNull } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordListDataLoaderEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { findManyRecords, records, totalCount, setRecordTableData, loading } =
    useLazyLoadRecordIndexTable(objectNameSingular);

  useEffect(() => {
    if (isNull(currentWorkspaceMember)) {
      return;
    }

    if (!hasInitialized) {
      findManyRecords();
      setHasInitialized(true);
    }
  }, [currentWorkspaceMember, findManyRecords, hasInitialized]);

  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
        totalCount,
      });
    }
  }, [records, totalCount, setRecordTableData, loading]);

  return null;
};

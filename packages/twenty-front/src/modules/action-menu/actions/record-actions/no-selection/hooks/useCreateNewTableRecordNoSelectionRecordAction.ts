import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { getRecordIndexIdFromObjectNamePlural } from '@/object-record/utils/getRecordIndexIdFromObjectNamePlural';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useMemo } from 'react';

export const useCreateNewTableRecordNoSelectionRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const recordTableId = getRecordIndexIdFromObjectNamePlural(
      objectMetadataItem.namePlural,
    );

    const blockRegistration = useMemo(() => {
      return (
        objectMetadataItem.nameSingular === CoreObjectNameSingular.BuyerLead
      );
    }, [objectMetadataItem.nameSingular]);

    const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

    const { createNewTableRecord } = useCreateNewTableRecord({
      objectMetadataItem,
      recordTableId,
    });

    const onClick = () => {
      createNewTableRecord();
    };

    return {
      shouldBeRegistered: !hasObjectReadOnlyPermission && !blockRegistration,
      onClick,
    };
  };

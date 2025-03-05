import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useDeleteProperty } from '@/ui/layout/show-page/hooks/useDeleteProperty';
import { isNull } from '@sniptt/guards';
import { useCallback, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useDeleteSingleRecordAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: objectMetadataItem.namePlural,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const { sortedFavorites: favorites } = useFavorites();
  const { deleteFavorite } = useDeleteFavorite();

  const {
    deletePropertyAndAllPublications,
    deletePublication,
    loading: loadingDelete,
  } = useDeleteProperty({
    objectRecordId: recordId,
  });

  const { closeRightDrawer } = useRightDrawer();

  const handleDeleteClick = useCallback(async () => {
    resetTableRowSelection();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    if (isDefined(foundFavorite)) {
      deleteFavorite(foundFavorite.id);
    }
    const isProperty =
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Property;
    const isPublication =
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Publication;

    if (isProperty) {
      await deletePropertyAndAllPublications();
    } else if (isPublication) {
      await deletePublication();
    }
    // Refetches the record after the deletion if it is a property or publication
    await deleteOneRecord(recordId);
  }, [
    resetTableRowSelection,
    favorites,
    objectMetadataItem.nameSingular,
    recordId,
    deleteFavorite,
    deletePropertyAndAllPublications,
    deletePublication,
    deleteOneRecord,
  ]);

  const isRemoteObject = objectMetadataItem.isRemote;

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const shouldBeRegistered =
    !isRemoteObject &&
    isNull(selectedRecord?.deletedAt) &&
    !hasObjectReadOnlyPermission;

  const onClick = () => {
    if (!shouldBeRegistered) {
      return;
    }

    setIsDeleteRecordsModalOpen(true);
  };

  return {
    shouldBeRegistered,
    onClick,
    ConfirmationModal: (
      <ConfirmationModal
        isOpen={isDeleteRecordsModalOpen}
        setIsOpen={setIsDeleteRecordsModalOpen}
        title={'Delete Record'}
        subtitle={
          'Are you sure you want to delete this record? It can be recovered from the Options menu.'
        }
        loading={loadingDelete}
        onConfirmClick={() => {
          handleDeleteClick();
          if (isInRightDrawer) {
            closeRightDrawer({ emitCloseEvent: false });
          }
        }}
        deleteButtonText={'Delete Record'}
      />
    ),
  };
};

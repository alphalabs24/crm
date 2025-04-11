import { useDeleteMessage } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteMessage';
import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { ShowPageImageBanner } from '@/ui/layout/show-page/components/nm/ShowPageImageBanner';
import { usePublications } from '@/ui/layout/show-page/contexts/PublicationsProvider';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { MOBILE_VIEWPORT } from 'twenty-ui';
import { useDeleteProperty } from '../../hooks/useDeleteProperty';

const StyledShowPageRightContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const StyledTabListContainer = styled.div<{ shouldDisplay: boolean }>`
  align-items: flex-end;
  background: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: ${({ shouldDisplay }) => (shouldDisplay ? 'flex' : 'none')};
  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  position: sticky;
  top: 0;
  z-index: 10;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    align-items: center;
    height: 40px;
  }
`;

const StyledContentContainer = styled.div<{ isInRightDrawer: boolean }>`
  flex: 1;
  padding-bottom: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.spacing(16) : 0};
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ShowPagePropertySubContainerProps = {
  layout?: RecordLayout;
  tabs: SingleTabProps[];
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
  loading: boolean;
  isNewRightDrawerItemLoading?: boolean;
  isPublication?: boolean;
};

// This view is used to display a property or publication.
// The isPublication flag is used to determine if the view shows a publication.
export const ShowPagePropertySubContainer = ({
  tabs,
  targetableObject,
  loading,
  isInRightDrawer = false,
  isPublication = false,
}: ShowPagePropertySubContainerProps) => {
  const tabListComponentId = `${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}-${targetableObject.id}`;
  const { activeTabId } = useTabList(tabListComponentId);
  const isMobile = useIsMobile();
  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);

  const objectNameSingular = targetableObject.targetObjectNameSingular;
  const capitalizedObjectNameSingular = capitalize(objectNameSingular);

  const { useMutations } = useNestermind();

  const {
    mutate: unpublishPublicationMutation,
    isPending: isUnpublishPending,
  } = useMutations.useUnpublishPublication({
    onSuccess: () => {
      enqueueSnackBar(t`Publication unpublished successfully`, {
        variant: SnackBarVariant.Success,
      });
      refetchPublications();
      refetchRecord();
      setIsUnpublishModalOpen(false);
    },
    onError: (error: Error) => {
      enqueueSnackBar(error?.message || t`Failed to unpublish publication`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  // Translations
  const { t } = useLingui();

  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const deleteModalRef = useRef<ModalRefType>(null);

  const { enqueueSnackBar } = useSnackBar();

  const isNewViewableRecordLoading = useRecoilValue(
    isNewViewableRecordLoadingState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  // Record
  const { record: recordFromStore, refetch: refetchRecord } = useRecordShowPage(
    targetableObject.targetObjectNameSingular,
    targetableObject.id,
  );

  const { refetch: refetchPublications } = usePublications();

  // Delete callback
  const onDelete = async () => {
    enqueueSnackBar(t`${objectNameSingular} deleted successfully`, {
      variant: SnackBarVariant.Success,
    });
    await refetchPublications();
    await refetchRecord();
    deleteModalRef.current?.close();
  };

  // Delete functions for properties and publications
  const {
    deletePublication,
    deletePropertyAndAllPublications,
    loading: loadingDelete,
  } = useDeleteProperty({
    objectRecordId: targetableObject.id,
    onDelete,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectNameSingular,
  });

  const deleteMessage = useDeleteMessage(objectMetadataItem);

  // When user presses on the accept button in the delete confirmation modal,
  // we delete the property or publication
  const handleConfirmDelete = async () => {
    if (isPublication) {
      await deletePublication();
    } else {
      await deletePropertyAndAllPublications();
      await refetchPublications;
    }
    // Refetches the record after the deletion if it is a property or publication
    await deleteOneRecord(targetableObject.id);
    setIsDeleteRecordsModalOpen(false);
  };

  // Refetch publications when the component mounts so we have the latest data.
  useEffect(() => {
    refetchPublications();
  }, [refetchPublications]);

  // New function to handle the actual unpublish action
  const handleConfirmUnpublish = () => {
    unpublishPublicationMutation({
      publicationId: targetableObject.id,
    });
  };

  const renderActiveTabContent = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.cards?.length) return null;

    return activeTab.cards.map((card, index) => {
      const CardComponent = CardComponents[card.type];
      return CardComponent ? (
        <CardComponent
          key={`${activeTab.id}-card-${index}`}
          targetableObject={targetableObject}
          isInRightDrawer={isInRightDrawer}
        />
      ) : null;
    });
  };

  return (
    <>
      <StyledShowPageRightContainer isMobile={isMobile}>
        {recordFromStore && (
          <ShowPageImageBanner targetableObject={targetableObject} />
        )}
        <StyledTabListContainer shouldDisplay={visibleTabs.length > 1}>
          <TabList
            behaveAsLinks={!isInRightDrawer}
            loading={loading || isNewViewableRecordLoading}
            tabListInstanceId={tabListComponentId}
            tabs={tabs}
            isInRightDrawer={isInRightDrawer}
          />
        </StyledTabListContainer>
        <StyledContentContainer isInRightDrawer={isInRightDrawer}>
          {renderActiveTabContent()}
        </StyledContentContainer>
        {isInRightDrawer && recordFromStore && !recordFromStore.deletedAt && (
          <RightDrawerFooter actions={[<RecordShowRightDrawerActionMenu />]} />
        )}
      </StyledShowPageRightContainer>

      <ConfirmationModal
        isOpen={isDeleteRecordsModalOpen}
        setIsOpen={setIsDeleteRecordsModalOpen}
        title={t`Delete ${capitalizedObjectNameSingular}`}
        subtitle={deleteMessage}
        loading={loadingDelete}
        onConfirmClick={() => {
          handleConfirmDelete();
        }}
        deleteButtonText={t`Delete ${capitalizedObjectNameSingular}`}
      />

      <ConfirmationModal
        isOpen={isUnpublishModalOpen}
        setIsOpen={setIsUnpublishModalOpen}
        title={t`Unpublish Publication`}
        subtitle={t`Are you sure you want to unpublish this publication? This will remove it from the published platform and make it unavailable to potential clients. You can always publish it again later.`}
        loading={isUnpublishPending}
        onConfirmClick={handleConfirmUnpublish}
        deleteButtonText={t`Unpublish`}
      />
    </>
  );
};

import { useDeleteMessage } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteMessage';
import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { PublishModal } from '@/ui/layout/show-page/components/nm/PublishModal';
import { ShowPageImageBanner } from '@/ui/layout/show-page/components/nm/ShowPageImageBanner';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import {
  Button,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
  MOBILE_VIEWPORT,
} from 'twenty-ui';
import { getEnv } from '~/utils/get-env';
import { useDeleteProperty } from '../../hooks/useDeleteProperty';
import { usePropertyAndPublicationDifferences } from '../../hooks/usePropertyAndPublicationDifferences';
import { usePublicationsOfProperty } from '../../hooks/usePublicationsOfProperty';
import { usePublicationValidation } from '../../hooks/usePublicationValidation';
import { ActionDropdown } from './ActionDropdown';
import { PropertyDifferencesModal } from './PropertyDifferencesModal';
import { PublishDraftModal } from './PublishDraftModal';
import { PlatformId } from './types/Platform';

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

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
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
  const navigate = useNavigate();
  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);

  const objectNameSingular = targetableObject.targetObjectNameSingular;
  const capitalizedObjectNameSingular = capitalize(objectNameSingular);

  // Token for API calls
  const tokenPair = useRecoilValue(tokenPairState);

  // Loading states
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);

  const dropdownId = `show-page-property-sub-container-dropdown-${targetableObject.id}`;

  // Translations
  const { t } = useLingui();

  // Dropdown
  const { closeDropdown } = useDropdown(dropdownId);

  const visibleTabs = tabs.filter((tab) => !tab.hide);

  // Modals
  const modalRef = useRef<ModalRefType>(null);
  const differencesModalRef = useRef<ModalRefType>(null);
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

  // Publications of Property
  const { refetch: refetchPublications } = usePublicationsOfProperty(
    isPublication ? undefined : recordFromStore?.id,
  );

  // Publication Drafts of Property
  const { publications: publicationDraftsOfProperty } =
    usePublicationsOfProperty(
      isPublication ? undefined : recordFromStore?.id,
      'draft',
    );

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

  const { differenceRecords } = usePropertyAndPublicationDifferences(
    publicationDraftsOfProperty,
    isPublication ? null : recordFromStore,
  );

  // Update handleDelete to show confirmation first
  const handleDelete = () => {
    setIsDeleteRecordsModalOpen(true);
    closeDropdown();
  };

  // Sync publication drafts with master data from property
  const syncPublications = async () => {
    try {
      setLoadingSync(true);
      // TODO useNestermind
      const response = await axios.post(
        `${getEnv('REACT_APP_NESTERMIND_SERVER_BASE_URL') ?? 'http://api.localhost'}/properties/sync?id=${targetableObject.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );
      if (response.status !== 201) {
        throw new Error('Failed to create draft, id was not returned');
      }

      enqueueSnackBar(t`Your Publication Drafts were synced successfully`, {
        variant: SnackBarVariant.Success,
      });
      differencesModalRef.current?.close();
      refetchPublications();
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setLoadingSync(false);
      closeDropdown();
    }
  };

  // Create a draft if the publication is published
  const createDraftIfPublished = async () => {
    try {
      setLoadingDraft(true);
      const response = await axios.post(
        `${getEnv('REACT_APP_NESTERMIND_SERVER_BASE_URL') ?? 'http://api.localhost'}/publications/duplicate?id=${targetableObject.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );
      if (response.status !== 201) {
        throw new Error('Failed to create draft, id was not returned');
      }

      enqueueSnackBar(t`Publication Draft created successfully`, {
        variant: SnackBarVariant.Success,
      });

      refetchPublications();

      const route = `${getLinkToShowPage(CoreObjectNameSingular.Publication, {
        id: response.data,
      })}/edit`;

      navigate(route);
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setLoadingDraft(false);
    }
  };

  // Edit publication
  const onEditPublication = () => {
    if (!recordFromStore) return;

    if (
      isPublication &&
      ['PUBLISHED', 'SCHEDULED'].includes(recordFromStore.stage)
    ) {
      createDraftIfPublished();
    } else {
      navigate(
        `${getLinkToShowPage(
          targetableObject.targetObjectNameSingular,
          recordFromStore,
        )}/edit`,
      );
    }
  };

  // Amount of differences between the property and the publication
  const differenceLength = useMemo(
    () =>
      differenceRecords?.length > 0
        ? `(${differenceRecords
            .map((difference) => difference.differences.length)
            .reduce((a, b) => a + b, 0)})`
        : '',
    [differenceRecords],
  );

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

  const { showPublishButton, validationDetails } = usePublicationValidation({
    record: recordFromStore,
    isPublication,
  });

  // Open the publish modal
  const handlePublishClick = () => {
    modalRef.current?.open();
  };
  const handleModalClose = () => {
    modalRef.current?.close();
  };

  const showDeleteButton = useMemo(
    () => !recordFromStore?.deletedAt,
    [recordFromStore],
  );

  const showSyncButton = useMemo(
    () =>
      !recordFromStore?.deletedAt &&
      !isPublication &&
      differenceRecords?.length > 0,
    [differenceRecords?.length, isPublication, recordFromStore?.deletedAt],
  );

  const showNewPublicationButton = useMemo(
    () => !recordFromStore?.deletedAt && differenceRecords?.length === 0,
    [differenceRecords?.length, recordFromStore?.deletedAt],
  );

  const showDropdown = useMemo(
    () => showNewPublicationButton || showSyncButton || showDeleteButton,
    [showNewPublicationButton, showSyncButton, showDeleteButton],
  );

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
          <StyledButtonContainer>
            {recordFromStore && !recordFromStore.deletedAt && (
              <Button
                title={t`Edit`}
                Icon={IconPencil}
                size="small"
                onClick={onEditPublication}
                disabled={loadingDraft}
              />
            )}

            {showDropdown && (
              <ActionDropdown
                dropdownId={dropdownId}
                actions={[
                  ...(showSyncButton // When sync button is primary
                    ? [
                        {
                          title: t`New Publication`,
                          Icon: IconPlus,
                          onClick: handlePublishClick,
                        },
                      ]
                    : []),
                  ...(showNewPublicationButton &&
                  publicationDraftsOfProperty.length > 0 &&
                  !isPublication // When publication button is primary
                    ? [
                        {
                          title: t`Sync Publications`,
                          Icon: IconRefresh,
                          onClick: syncPublications,
                          disabled: loadingSync,
                        },
                      ]
                    : []),
                  ...(showDeleteButton
                    ? [
                        {
                          title: t`Delete`,
                          Icon: IconTrash,
                          onClick: handleDelete,
                          distructive: true,
                          disabled: loadingDelete,
                        },
                      ]
                    : []),
                ]}
                primaryAction={
                  showNewPublicationButton && showPublishButton
                    ? {
                        title: isPublication ? t`Publish` : t`New Publication`,
                        Icon: isPublication ? IconUpload : IconPlus,
                        onClick: handlePublishClick,
                      }
                    : showSyncButton
                      ? {
                          title: t`Differences ${differenceLength}`,
                          onClick: () => differencesModalRef.current?.open(),
                        }
                      : null
                }
              />
            )}
          </StyledButtonContainer>
        </StyledTabListContainer>
        <StyledContentContainer isInRightDrawer={isInRightDrawer}>
          {renderActiveTabContent()}
        </StyledContentContainer>
        {isInRightDrawer && recordFromStore && !recordFromStore.deletedAt && (
          <RightDrawerFooter actions={[<RecordShowRightDrawerActionMenu />]} />
        )}
      </StyledShowPageRightContainer>

      {isPublication ? (
        <PublishModal
          ref={modalRef}
          onClose={handleModalClose}
          targetableObject={targetableObject}
          validationDetails={validationDetails}
          platformId={recordFromStore?.platform ?? PlatformId.Newhome}
        />
      ) : (
        <PublishDraftModal
          ref={modalRef}
          onClose={handleModalClose}
          targetableObject={targetableObject}
          validationDetails={validationDetails}
        />
      )}

      {differenceRecords?.length > 0 && (
        <PropertyDifferencesModal
          ref={differencesModalRef}
          differences={differenceRecords}
          onClose={() => differencesModalRef.current?.close()}
          onSync={syncPublications}
          propertyRecordId={recordFromStore?.id ?? ''}
          publicationRecordId={publicationDraftsOfProperty?.[0]?.id ?? ''}
        />
      )}

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
    </>
  );
};

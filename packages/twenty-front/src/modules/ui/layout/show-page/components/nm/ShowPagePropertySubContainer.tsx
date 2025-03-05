import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { PublishModal } from '@/ui/layout/show-page/components/nm/PublishModal';
import { ShowPageImageBanner } from '@/ui/layout/show-page/components/nm/ShowPageImageBanner';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  Button,
  IconPencil,
  IconUpload,
  IconRefresh,
  IconDotsVertical,
  MenuItem,
  IconTrash,
  IconPlus,
} from 'twenty-ui';
import { PublishDraftModal } from './PublishDraftModal';
import axios from 'axios';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { usePublicationsOfProperty } from '../../hooks/usePublicationsOfProperty';
import { usePropertyAndPublicationDifferences } from '../../hooks/usePropertyAndPublicationDifferences';
import { PropertyDifferencesModal } from './PropertyDifferencesModal';
import { usePublicationValidation } from '../../hooks/usePublicationValidation';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { AppPath } from '@/types/AppPath';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import DeleteConfirmationModal from '@/ui/layout/show-page/components/nm/DeleteConfirmationModal';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';

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
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(2)};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: ${({ shouldDisplay }) => (shouldDisplay ? 'flex' : 'none')};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.background.primary};
  z-index: 10;
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

const StyledModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledModalDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.5;
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
  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  // Token for API calls
  const tokenPair = useRecoilValue(tokenPairState);

  // Loading states
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  // Record
  const { record: recordFromStore, refetch: refetchRecord } = useRecordShowPage(
    targetableObject.targetObjectNameSingular,
    targetableObject.id,
  );

  // Publications of Property
  const {
    publications: publicationDraftsOfProperty,
    refetch: refetchPublications,
  } = usePublicationsOfProperty(
    isPublication ? undefined : recordFromStore?.id,
    'draft',
  );

  // Refetch all publications when something changes through the API
  const { refetch: refetchAllPublications } = usePublicationsOfProperty(
    isPublication ? undefined : recordFromStore?.id,
  );

  // Refetch publications when the component mounts so we have the latest data.
  useEffect(() => {
    refetchPublications();
    refetchAllPublications();
  }, [refetchAllPublications, refetchPublications]);

  const { differenceRecords } = usePropertyAndPublicationDifferences(
    publicationDraftsOfProperty,
    isPublication ? null : recordFromStore,
  );

  // Update handleDelete to show confirmation first
  const handleDelete = () => {
    deleteModalRef.current?.open();
    closeDropdown();
  };

  const handleConfirmDelete = async () => {
    try {
      setLoadingDelete(true);
      const response = await axios.delete(
        `${window._env_?.REACT_APP_PUBLICATION_SERVER_BASE_URL ?? 'http://api.localhost'}/${objectNamePlural}/delete?id=${targetableObject.id}`,
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error('Failed to delete property or publication');
      }

      const objectNameSingular = targetableObject.targetObjectNameSingular;
      enqueueSnackBar(t`${objectNameSingular} deleted successfully`, {
        variant: SnackBarVariant.Success,
      });
      await refetchAllPublications();
      await refetchRecord();
      deleteModalRef.current?.close();
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const syncPublications = async () => {
    try {
      setLoadingSync(true);
      const response = await axios.post(
        `${window._env_?.REACT_APP_PUBLICATION_SERVER_BASE_URL ?? 'http://api.localhost'}/properties/sync?id=${targetableObject.id}`,
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

  const createDraftIfPublished = async () => {
    try {
      setLoadingDraft(true);
      const response = await axios.post(
        `${window._env_?.REACT_APP_PUBLICATION_SERVER_BASE_URL ?? 'http://api.localhost'}/publications/duplicate?id=${targetableObject.id}`,
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

  const openModal = () => {
    modalRef.current?.open();
  };

  const handleModalClose = () => {
    modalRef.current?.close();
  };

  const { showPublishButton, validationDetails } = usePublicationValidation({
    record: recordFromStore,
    differences: differenceRecords,
    isPublication,
  });

  const handlePublishClick = () => {
    openModal();
  };

  const showDeleteButton = useMemo(
    () => !recordFromStore?.deletedAt,
    [recordFromStore],
  );

  const showSyncButton = useMemo(
    () => !isPublication && differenceRecords?.length === 0,
    [differenceRecords, isPublication],
  );

  const showNewPublicationButton = useMemo(
    () => !isPublication && differenceRecords?.length > 0,
    [differenceRecords, isPublication],
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

            {showPublishButton && !recordFromStore?.deletedAt && (
              <Button
                title={isPublication ? t`Publish` : t`New Publication`}
                variant="primary"
                accent="blue"
                size="small"
                Icon={isPublication ? IconUpload : IconPlus}
                onClick={handlePublishClick}
              />
            )}

            {differenceRecords?.length > 0 && (
              <Button
                onClick={() => differencesModalRef.current?.open()}
                variant="primary"
                accent="blue"
                title={t`Differences ${differenceLength}`}
                size="small"
              />
            )}

            {showDropdown && (
              <Dropdown
                dropdownId={dropdownId}
                clickableComponent={
                  <Button
                    title={t`More`}
                    Icon={IconDotsVertical}
                    size="small"
                  />
                }
                dropdownMenuWidth={160}
                dropdownComponents={
                  <DropdownMenuItemsContainer>
                    {showNewPublicationButton && (
                      <MenuItem
                        text={t`New Publication`}
                        LeftIcon={IconPlus}
                        onClick={() => {
                          openModal();
                          closeDropdown();
                        }}
                      />
                    )}
                    {showSyncButton && (
                      <MenuItem
                        text={t`Sync Publications`}
                        LeftIcon={IconRefresh}
                        onClick={syncPublications}
                        disabled={loadingSync}
                      />
                    )}
                    {showDeleteButton && (
                      <MenuItem
                        text={t`Delete`}
                        accent="danger"
                        LeftIcon={IconTrash}
                        onClick={handleDelete}
                        disabled={loadingDelete}
                      />
                    )}
                  </DropdownMenuItemsContainer>
                }
                dropdownHotkeyScope={{ scope: dropdownId }}
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

      <DeleteConfirmationModal
        ref={deleteModalRef}
        onDelete={handleConfirmDelete}
        onClose={() => deleteModalRef.current?.close()}
        loading={loadingDelete}
        description={
          isPublication
            ? t`Are you sure you want to delete this publication?`
            : t`Are you sure you want to delete this property and all it's publications?`
        }
      />
    </>
  );
};

import { useNestermind } from '@/api/hooks/useNestermind';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import { PropertyReportingCard } from '@/object-record/record-show/components/nm/cards/PropertyReportingCard';
import { PublicationCompletionCard } from '@/object-record/record-show/components/nm/cards/PublicationCompletionCard';
import { PublicationStatusCard } from '@/object-record/record-show/components/nm/cards/PublicationStatusCard';
import { PublicationBreadcrumb } from '@/object-record/record-show/components/nm/publication/PublicationBreadcrumb';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ActionDropdown } from '@/ui/layout/show-page/components/nm/ActionDropdown';
import { PublicationDifferencesModal } from '@/ui/layout/show-page/components/nm/PublicationDifferencesModal';
import { PublishModal } from '@/ui/layout/show-page/components/nm/PublishModal';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import { useDeleteProperty } from '@/ui/layout/show-page/hooks/useDeleteProperty';
import { useDraftPublishedDifferences } from '@/ui/layout/show-page/hooks/useDraftPublishedDifferences';
import { usePublicationValidation } from '@/ui/layout/show-page/hooks/usePublicationValidation';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AxiosResponse } from 'axios';
import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  IconCloudOff,
  IconPencil,
  IconTrash,
  IconUpload,
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
} from 'twenty-ui';

const StyledPageContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(4)};

    ${({ isInRightDrawer }) =>
      isInRightDrawer &&
      css`
        padding: 0;
      `}
  }
`;

const StyledContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;

    ${({ isInRightDrawer }) =>
      isInRightDrawer &&
      css`
        flex-direction: column;

        padding: 0;
      `}
  }
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex: 1;
    min-width: 0;
  }

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 1250px;
  }
`;

const StyledSideContent = styled.div<{ isInRightDrawer?: boolean }>`
  display: none;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    width: 380px;
  }
`;

const StyledImagesSection = styled.div`
  width: 100%;
`;

const StyledOverviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    > * {
      flex: 1;
      min-width: 300px;
    }
  }
`;

const StyledDetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    > * {
      flex: 1;
      min-width: 300px;
    }
  }
`;

const StyledPageHeader = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(0, 0, 4)};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    align-items: center;
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-left: auto;
`;

type PublicationDetailPageProps = {
  publicationGroup: Record<PublicationStage, ObjectRecord[]>;
  stage: PublicationStage;
  isInRightDrawer?: boolean;
  recordLoading: boolean;
  refetch: () => void;
};

export const PublicationDetailPage = ({
  publicationGroup,
  stage,
  isInRightDrawer,
  recordLoading,
  refetch,
}: PublicationDetailPageProps) => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });
  const { enqueueSnackBar } = useSnackBar();
  const [isDeleteRecordsModalOpen, setIsDeleteRecordsModalOpen] =
    useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [isRevertChangesModalOpen, setIsRevertChangesModalOpen] =
    useState(false);
  const [isPublishDifferencesModalOpen, setIsPublishDifferencesModalOpen] =
    useState(false);
  const modalRef = useRef<ModalRefType>(null);
  const differencesModalRef = useRef<ModalRefType>(null);

  // This is either the draft or the published record depending on the stage
  const publication: ObjectRecord | undefined = useMemo(() => {
    return publicationGroup[stage]?.[0];
  }, [publicationGroup, stage]);

  const draftRecord: ObjectRecord | undefined = useMemo(() => {
    return publicationGroup[PublicationStage.Draft]?.[0];
  }, [publicationGroup]);

  const publishedRecord: ObjectRecord | undefined = useMemo(() => {
    return publicationGroup[PublicationStage.Published]?.[0];
  }, [publicationGroup]);

  const { hasDifferences, totalDifferenceCount, differences } =
    useDraftPublishedDifferences(draftRecord, publishedRecord);

  const { useMutations } = useNestermind();

  // Check if we have both a draft and a published version
  const hasDraftAndPublished = useMemo(() => {
    return (
      publicationGroup[PublicationStage.Draft]?.length > 0 &&
      publicationGroup[PublicationStage.Published]?.length > 0
    );
  }, [publicationGroup]);

  const {
    mutate: duplicatePublicationMutation,
    isPending: isDuplicatePending,
  } = useMutations.useDuplicatePublication({
    onSuccess: (response: AxiosResponse<string>) => {
      const route = `${getLinkToShowPage(CoreObjectNameSingular.Publication, {
        id: response.data,
      })}/edit`;

      navigate(route);
    },
    onError: (error: Error) => {
      enqueueSnackBar(error?.message || t`Failed to create publication draft`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const {
    mutate: unpublishPublicationMutation,
    isPending: isUnpublishPending,
  } = useMutations.useUnpublishPublication({
    onSuccess: () => {
      enqueueSnackBar(t`Publication unpublished successfully`, {
        variant: SnackBarVariant.Success,
      });
      setIsUnpublishModalOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      enqueueSnackBar(error?.message || t`Failed to unpublish publication`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  // Delete functions for publications
  const { deletePublication, loading: loadingDelete } = useDeleteProperty({
    objectRecordId: publication.id,
    onDelete: async () => {
      enqueueSnackBar(t`Publication deleted successfully`, {
        variant: SnackBarVariant.Success,
      });
      handleBackClick();
    },
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });

  const handleBackClick = () => {
    // Create a new URLSearchParams object based on the current one
    const newParams = new URLSearchParams(searchParams);
    // Remove the platform parameter
    newParams.delete('platform');

    // Get current hash to preserve tab selection
    const currentHash = window.location.hash;

    // Use navigate to preserve hash fragment when setting search params
    navigate({
      pathname: location.pathname,
      search: newParams.toString(),
      hash: currentHash,
    });
  };

  // Handle edit click - create a draft if publication is published
  const onEditPublication = () => {
    if (!publication) return;

    if (['PUBLISHED', 'SCHEDULED'].includes(publication.stage)) {
      createDraftIfPublished();
    } else {
      navigate(
        `${getLinkToShowPage(CoreObjectNameSingular.Publication, {
          id: publication.id,
        })}/edit`,
      );
    }
  };

  // Create a draft if the publication is published
  const createDraftIfPublished = () => {
    duplicatePublicationMutation({
      publicationId: publication.id,
    });
  };

  // Handle delete click
  const handleDelete = () => {
    setIsDeleteRecordsModalOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    await deletePublication();
    await deleteOneRecord(publication.id);
    setIsDeleteRecordsModalOpen(false);
  };

  // Handle revert changes click
  const handleRevertChanges = () => {
    setIsRevertChangesModalOpen(true);
  };

  // Confirm revert changes (delete draft)
  const handleConfirmRevertChanges = async () => {
    try {
      // delete
      await deleteOneRecord(draftRecord?.id || '');
    } catch (error) {
      enqueueSnackBar(t`Failed to delete changes`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsRevertChangesModalOpen(false);
    }
  };

  // Handle unpublish click
  const handleUnpublish = () => {
    setIsUnpublishModalOpen(true);
  };

  // Confirm unpublish
  const handleConfirmUnpublish = async () => {
    try {
      await unpublishPublicationMutation({
        publicationId: publication.id,
      });
    } catch (error) {
      // Error is already handled in the mutation's onError
    }
  };

  // Open the appropriate publish modal
  const handlePublishClick = () => {
    if (hasDraftAndPublished && hasDifferences) {
      // If we have differences, show the differences modal which handles publishing directly
      setIsPublishDifferencesModalOpen(true);
    } else {
      // Otherwise, open the regular publish modal for simple publish
      modalRef.current?.open();
    }
  };

  const handleModalClose = () => {
    modalRef.current?.close();
  };

  const handleDiffModalClose = () => {
    setIsPublishDifferencesModalOpen(false);
  };

  const { showPublishButton, validationDetails } = usePublicationValidation({
    record: draftRecord,
    isPublication: true,
  });

  // Determine which buttons to show based on publication state
  const showDeleteButton = useMemo(
    () => !publication?.deletedAt && publication?.stage !== 'PUBLISHED',
    [publication?.deletedAt, publication?.stage],
  );

  const showUnpublishButton = useMemo(
    () => !publication?.deletedAt && publication?.stage === 'PUBLISHED',
    [publication?.deletedAt, publication?.stage],
  );

  const showPublishAction = useMemo(
    () => showPublishButton && !publication?.deletedAt,
    [showPublishButton, publication?.deletedAt],
  );

  // Show "Republish" in dropdown when we have a draft without differences
  const showRepublishAction = useMemo(
    () => hasDraftAndPublished && !hasDifferences,
    [hasDraftAndPublished, hasDifferences],
  );

  // Show "Publish Changes" as primary when there are differences
  const showPublishChangesAction = useMemo(
    () => hasDraftAndPublished && hasDifferences,
    [hasDraftAndPublished, hasDifferences],
  );

  // Show "Revert Changes" when we have a draft with differences
  const showRevertChangesAction = useMemo(
    () => hasDraftAndPublished && hasDifferences,
    [hasDraftAndPublished, hasDifferences],
  );

  const dropdownId = `publication-detail-dropdown-${publication?.id}`;

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <PublicationBreadcrumb
          platformId={publication.platform}
          onBackClick={handleBackClick}
        />
        <StyledButtonContainer>
          {publication && !publication.deletedAt && (
            <Button
              title={t`Edit`}
              Icon={IconPencil}
              size="small"
              onClick={onEditPublication}
              disabled={isDuplicatePending || isUnpublishPending}
            />
          )}

          {(showDeleteButton ||
            showUnpublishButton ||
            showPublishAction ||
            showRepublishAction ||
            showPublishChangesAction ||
            showRevertChangesAction) && (
            <ActionDropdown
              dropdownId={dropdownId}
              actions={[
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
                ...(hasDraftAndPublished &&
                showPublishChangesAction &&
                showUnpublishButton
                  ? [
                      {
                        title: t`Unpublish`,
                        Icon: IconCloudOff,
                        onClick: handleUnpublish,
                      },
                    ]
                  : []),
                ...(showRepublishAction
                  ? [
                      {
                        title: t`Republish`,
                        Icon: IconUpload,
                        onClick: handlePublishClick,
                      },
                    ]
                  : []),
                ...(showRevertChangesAction
                  ? [
                      {
                        title: t`Revert Changes`,
                        Icon: IconTrash,
                        onClick: handleRevertChanges,
                        distructive: true,
                      },
                    ]
                  : []),
              ]}
              primaryAction={
                showPublishChangesAction
                  ? {
                      title: hasDifferences
                        ? t`Publish Changes (${totalDifferenceCount})`
                        : t`Publish`,
                      Icon: IconUpload,
                      onClick: handlePublishClick,
                    }
                  : !hasDraftAndPublished && showPublishAction
                    ? {
                        title: t`Publish`,
                        Icon: IconUpload,
                        onClick: handlePublishClick,
                      }
                    : showUnpublishButton && !hasDifferences
                      ? {
                          title: t`Unpublish`,
                          Icon: IconCloudOff,
                          onClick: handleUnpublish,
                        }
                      : null
              }
            />
          )}
        </StyledButtonContainer>
      </StyledPageHeader>
      <StyledContentContainer isInRightDrawer={isInRightDrawer}>
        <StyledMainContent>
          <StyledImagesSection>
            <PropertyImagesCard
              loading={recordLoading}
              targetableObject={{
                id: publication.id,
                targetObjectNameSingular: CoreObjectNameSingular.Publication,
              }}
            />
          </StyledImagesSection>

          <StyledOverviewSection>
            <PropertyBasicInfoCard
              record={publication}
              loading={recordLoading}
              isPublication
            />
            <PropertyDetailsCard
              record={publication}
              loading={recordLoading}
              objectMetadataItem={objectMetadataItem}
            />
          </StyledOverviewSection>

          <StyledDetailsSection>
            {/*<PropertyRelationsCard
            record={publication}
            loading={recordLoading}
            objectMetadataItem={objectMetadataItem}
          />*/}
            <PropertyAddressCard record={publication} loading={recordLoading} />
          </StyledDetailsSection>
        </StyledMainContent>

        <StyledSideContent isInRightDrawer={isInRightDrawer}>
          <PublicationCompletionCard record={publication} />
          <PublicationStatusCard stage={publication.stage} />

          <PropertyInquiriesCard recordId={publication.id} isPublication />
          <PropertyReportingCard />
        </StyledSideContent>
      </StyledContentContainer>

      {/* Modals */}
      {!hasDraftAndPublished || !hasDifferences ? (
        <PublishModal
          ref={modalRef}
          onClose={handleModalClose}
          targetableObject={{
            id: draftRecord?.id,
            targetObjectNameSingular: CoreObjectNameSingular.Publication,
          }}
          validationDetails={validationDetails}
          platformId={draftRecord?.platform ?? PlatformId.Newhome}
          hasDraftAndPublished={hasDraftAndPublished}
        />
      ) : (
        <PublicationDifferencesModal
          ref={differencesModalRef}
          draftId={draftRecord?.id}
          publishedId={publishedRecord?.id}
          differences={differences?.[0]?.differences || []}
          platform={draftRecord?.platform || PlatformId.Newhome}
          onClose={handleDiffModalClose}
          isOpen={isPublishDifferencesModalOpen}
          validationDetails={validationDetails}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteRecordsModalOpen}
        setIsOpen={setIsDeleteRecordsModalOpen}
        title={t`Delete Publication`}
        subtitle={t`Are you sure you want to delete this publication? This action cannot be undone.`}
        loading={loadingDelete}
        onConfirmClick={handleConfirmDelete}
        deleteButtonText={t`Delete`}
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

      <ConfirmationModal
        isOpen={isRevertChangesModalOpen}
        setIsOpen={setIsRevertChangesModalOpen}
        title={t`Revert Changes`}
        subtitle={t`Are you sure you want to revert all changes? This will delete the draft and any changes you've made. This action cannot be undone.`}
        loading={loadingDelete}
        onConfirmClick={handleConfirmRevertChanges}
        deleteButtonText={t`Revert Changes`}
      />
    </StyledPageContainer>
  );
};

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
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
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
import { PublishModal } from '@/ui/layout/show-page/components/nm/PublishModal';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import { useDeleteProperty } from '@/ui/layout/show-page/hooks/useDeleteProperty';
import { usePublicationValidation } from '@/ui/layout/show-page/hooks/usePublicationValidation';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AxiosResponse } from 'axios';
import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { capitalize } from 'twenty-shared';
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
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(0, 0, 4)};
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
};

export const PublicationDetailPage = ({
  publicationGroup,
  stage,
  isInRightDrawer,
  recordLoading,
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
  const modalRef = useRef<ModalRefType>(null);

  const { useMutations } = useNestermind();

  const publication = useMemo(() => {
    return publicationGroup[stage][0];
  }, [publicationGroup, stage]);

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

      // Go back to publication list after unpublishing
      handleBackClick();
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

  const deleteMessage = `Are you sure you want to delete this publication? This action cannot be undone.`;

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

  // Handle unpublish click
  const handleUnpublish = () => {
    setIsUnpublishModalOpen(true);
  };

  // Confirm unpublish
  const handleConfirmUnpublish = () => {
    unpublishPublicationMutation({
      publicationId: publication.id,
    });
  };

  // Open the publish modal
  const handlePublishClick = () => {
    modalRef.current?.open();
  };

  const handleModalClose = () => {
    modalRef.current?.close();
  };

  const { showPublishButton, validationDetails } = usePublicationValidation({
    record: publication,
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

          {(showDeleteButton || showUnpublishButton || showPublishAction) && (
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
              ]}
              primaryAction={
                showPublishAction
                  ? {
                      title: t`Publish`,
                      Icon: IconUpload,
                      onClick: handlePublishClick,
                    }
                  : showUnpublishButton
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
            <PropertyRelationsCard
              record={publication}
              loading={recordLoading}
              objectMetadataItem={objectMetadataItem}
            />
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
      <PublishModal
        ref={modalRef}
        onClose={handleModalClose}
        targetableObject={{
          id: publication.id,
          targetObjectNameSingular: CoreObjectNameSingular.Publication,
        }}
        validationDetails={validationDetails}
        platformId={publication?.platform ?? PlatformId.Newhome}
      />

      <ConfirmationModal
        isOpen={isDeleteRecordsModalOpen}
        setIsOpen={setIsDeleteRecordsModalOpen}
        title={t`Delete ${capitalize(CoreObjectNameSingular.Publication)}`}
        subtitle={deleteMessage}
        loading={loadingDelete}
        onConfirmClick={handleConfirmDelete}
        deleteButtonText={t`Delete ${capitalize(CoreObjectNameSingular.Publication)}`}
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
    </StyledPageContainer>
  );
};

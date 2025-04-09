import { useDeleteMessage } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteMessage';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import { PropertyPublicationsCard } from '@/object-record/record-show/components/nm/cards/PropertyPublicationsCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { PropertyReportingCard } from '@/object-record/record-show/components/nm/cards/PropertyReportingCard';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ActionDropdown } from '@/ui/layout/show-page/components/nm/ActionDropdown';
import { PropertyDifferencesModal } from '@/ui/layout/show-page/components/nm/PropertyDifferencesModal';
import { useDeleteProperty } from '@/ui/layout/show-page/hooks/useDeleteProperty';
import { usePropertyAndPublicationDifferences } from '@/ui/layout/show-page/hooks/usePropertyAndPublicationDifferences';
import { usePublicationsOfProperty } from '@/ui/layout/show-page/hooks/usePublicationsOfProperty';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { capitalize } from 'twenty-shared';
import {
  Button,
  IconChevronRight,
  IconPencil,
  IconRefresh,
  IconTrash,
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  useIsMobile,
} from 'twenty-ui';

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

const StyledLinkWrapper = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const StyledDetailsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const StyledPublicationsSection = styled.div`
  display: none;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    width: 100%;
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

const StyledBreadcrumb = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledBreadcrumbIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

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

export const StyledComingSoonText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const PropertyBreadcrumb = () => {
  const { t } = useLingui();

  return (
    <StyledBreadcrumb>
      <StyledLinkWrapper to="/properties">
        <Trans>Properties</Trans>
      </StyledLinkWrapper>
      <StyledBreadcrumbIcon>
        <IconChevronRight size={16} />
      </StyledBreadcrumbIcon>
      <div>
        <Trans>Property Details</Trans>
      </div>
    </StyledBreadcrumb>
  );
};

type PropertyDetailsProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
  isInRightDrawer?: boolean;
};

export const PropertyDetails = ({
  targetableObject,
  isInRightDrawer,
}: PropertyDetailsProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const differencesModalRef = useRef<ModalRefType>(null);

  const dropdownId = `property-details-dropdown-${targetableObject.id}`;
  const { closeDropdown } = useDropdown(dropdownId);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const capitalizedObjectNameSingular = capitalize(
    targetableObject.targetObjectNameSingular,
  );
  const deleteMessage = useDeleteMessage(objectMetadataItem);

  // Get record data
  const { recordFromStore: property, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  // Publications
  const {
    publications: publicationDraftsOfProperty,
    refetch: refetchPublications,
  } = usePublicationsOfProperty(targetableObject.id, 'draft');

  // Delete handling
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const onDelete = async () => {
    enqueueSnackBar(
      t`${targetableObject.targetObjectNameSingular} deleted successfully`,
      {
        variant: SnackBarVariant.Success,
      },
    );
    await refetchPublications();
  };

  const { deletePropertyAndAllPublications, loading: loadingDelete } =
    useDeleteProperty({
      objectRecordId: targetableObject.id,
      onDelete,
    });

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    closeDropdown();
  };

  const handleConfirmDelete = async () => {
    await deletePropertyAndAllPublications();
    await refetchPublications();
    await deleteOneRecord(targetableObject.id);
    setIsDeleteModalOpen(false);
  };

  // Sync publications
  const { useMutations } = useNestermind();

  const { mutate: syncPublicationMutation, isPending: isSyncPending } =
    useMutations.useSyncPublicationsWithProperty(targetableObject.id, {
      onSuccess: () => {
        enqueueSnackBar(t`Your Publication Drafts were synced successfully`, {
          variant: SnackBarVariant.Success,
        });
        differencesModalRef.current?.close();
        refetchPublications();
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || t`Failed to sync publications`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const syncPublications = () => {
    syncPublicationMutation();
    closeDropdown();
  };

  // Publication differences
  const { differenceRecords } = usePropertyAndPublicationDifferences(
    publicationDraftsOfProperty,
    property,
  );

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

  // Determine visibility of buttons based on state
  const showDeleteButton = useMemo(
    () => !property?.deletedAt,
    [property?.deletedAt],
  );

  const showSyncButton = useMemo(
    () => !property?.deletedAt && differenceRecords?.length > 0,
    [differenceRecords?.length, property?.deletedAt],
  );

  if (recordLoading || !property) {
    return (
      <StyledLoadingContainer>
        <Trans>Loading...</Trans>
      </StyledLoadingContainer>
    );
  }

  return (
    <StyledPageContainer isInRightDrawer={isInRightDrawer}>
      <StyledPageHeader>
        <StyledButtonContainer>
          {property && !property.deletedAt && (
            <StyledLinkWrapper
              to={`${getLinkToShowPage(
                targetableObject.targetObjectNameSingular,
                {
                  id: targetableObject.id,
                },
              )}/edit`}
            >
              <Button title={t`Edit`} Icon={IconPencil} size="small" />
            </StyledLinkWrapper>
          )}

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
              showSyncButton
                ? {
                    title: t`Sync Publications ${differenceLength}`,
                    Icon: IconRefresh,
                    onClick: () => differencesModalRef.current?.open(),
                    disabled: isSyncPending,
                  }
                : null
            }
          />
        </StyledButtonContainer>
      </StyledPageHeader>
      <StyledContentContainer isInRightDrawer={isInRightDrawer}>
        <StyledMainContent>
          <StyledImagesSection>
            <PropertyImagesCard
              loading={recordLoading}
              targetableObject={targetableObject}
            />
          </StyledImagesSection>

          <StyledDetailsSection>
            <PropertyBasicInfoCard record={property} loading={recordLoading} />
            <PropertyDetailsCard
              record={property}
              loading={recordLoading}
              objectMetadataItem={objectMetadataItem}
            />
          </StyledDetailsSection>

          <StyledDetailsSection>
            <PropertyRelationsCard
              record={property}
              loading={recordLoading}
              objectMetadataItem={objectMetadataItem}
            />
            <PropertyAddressCard record={property} loading={recordLoading} />
          </StyledDetailsSection>

          <StyledPublicationsSection>
            <PropertyPublicationsCard
              record={property}
              loading={recordLoading}
            />
          </StyledPublicationsSection>
        </StyledMainContent>

        {isMobile ? null : (
          <StyledSideContent isInRightDrawer={isInRightDrawer}>
            <PropertyInquiriesCard recordId={property.id} />
            <PropertyReportingCard />
          </StyledSideContent>
        )}
      </StyledContentContainer>

      {/* Modals */}
      {differenceRecords?.length > 0 && (
        <PropertyDifferencesModal
          ref={differencesModalRef}
          differences={differenceRecords}
          onClose={() => differencesModalRef.current?.close()}
          onSync={syncPublications}
          propertyRecordId={property?.id ?? ''}
          publicationRecordId={publicationDraftsOfProperty?.[0]?.id ?? ''}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title={t`Delete ${capitalizedObjectNameSingular}`}
        subtitle={deleteMessage}
        loading={loadingDelete}
        onConfirmClick={handleConfirmDelete}
        deleteButtonText={t`Delete ${capitalizedObjectNameSingular}`}
      />
    </StyledPageContainer>
  );
};

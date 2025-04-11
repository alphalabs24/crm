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
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { PropertyReportingCard } from '@/object-record/record-show/components/nm/cards/PropertyReportingCard';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ActionDropdown } from '@/ui/layout/show-page/components/nm/ActionDropdown';
import { PropertyDifferencesModal } from '@/ui/layout/show-page/components/nm/PropertyDifferencesModal';
import { usePublications } from '@/ui/layout/show-page/contexts/PublicationsProvider';
import { useDeleteProperty } from '@/ui/layout/show-page/hooks/useDeleteProperty';
import { usePropertyAndPublicationDifferences } from '@/ui/layout/show-page/hooks/usePropertyAndPublicationDifferences';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { capitalize } from 'twenty-shared';
import {
  Button,
  IconCheck,
  IconCopy,
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

const StyledPageTitle = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledPropertyRef = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
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
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const differencesModalRef = useRef<ModalRefType>(null);

  const [isCopied, setIsCopied] = useState(false);

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

  const { publicationGroups, refetch: refetchPublications } = usePublications();

  const publicationDraftsOfProperty = useMemo(() => {
    return publicationGroups.all[PublicationStage.Draft];
  }, [publicationGroups]);

  const objectNameSingular = targetableObject.targetObjectNameSingular;

  // Delete handling
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular,
  });

  const onDelete = async () => {
    enqueueSnackBar(t`${objectNameSingular} deleted successfully`, {
      variant: SnackBarVariant.Success,
    });
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

  const syncPublications = useCallback(async () => {
    await syncPublicationMutation();
    closeDropdown();
  }, [syncPublicationMutation, closeDropdown]);

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

  // Reset copy state
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

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
        <StyledPageTitle>
          {property?.name}
          <StyledPropertyRef
            onClick={() => {
              navigator.clipboard.writeText(property?.refProperty || '');
              setIsCopied(true);
            }}
          >
            {property?.refProperty}
            {isCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </StyledPropertyRef>
        </StyledPageTitle>
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

          {/* <StyledPublicationsSection>
            <PropertyPublicationsCard
              record={property}
              loading={recordLoading}
            />
          </StyledPublicationsSection> */}
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

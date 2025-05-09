import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { ShowPageSummaryCardSkeletonLoader } from '@/ui/layout/show-page/components/ShowPageSummaryCardSkeletonLoader';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import groupBy from 'lodash.groupby';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared';
import {
  Button,
  CircularProgressBar,
  IconCheck,
  IconSparkles,
  IconUpload,
  IconX,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated/graphql';
import { useSubcategoryByCategory } from '../../hooks/useSubcategoryByCategory';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyPublicationsCard } from '@/object-record/record-show/components/nm/cards/PropertyPublicationsCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
`;

const StyledFullWidthCard = styled.div`
  grid-column: 1 / -1;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? 'inherit' : theme.font.color.primary};
  display: flex;
  flex: 1 0 auto;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: flex-start;
`;

const StyledBottomBorder = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledContent = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledModalContent = styled(Modal.Content)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledModalDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledNesterColored = styled.span`
  color: ${({ theme }) => theme.color.purple};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
`;

const StyledModalHeaderButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledModalTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledDropZoneContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `2px dashed ${theme.border.color.strong}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: center;
  text-align: center;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledDropZoneContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
`;

const StyledUploadTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledUploadSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledUploadIcon = styled(IconUpload)`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledModalTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocumentContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocumentInfo = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocumentName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const requiredPublicationFields = ['agency', 'platform', 'category'];

type ObjectOverviewProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
  isNewRightDrawerItemLoading?: boolean;
};

export const ObjectOverview = ({
  targetableObject,
  isInRightDrawer,
  isNewRightDrawerItemLoading,
}: ObjectOverviewProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  const {
    recordFromStore,
    recordLoading,
    objectMetadataItem,
    labelIdentifierFieldMetadataItem,
    isPrefetchLoading,
    objectMetadataItems,
  } = useRecordShowContainerData({
    objectNameSingular: targetableObject.targetObjectNameSingular,
    objectRecordId: targetableObject.id,
  });

  const { objectMetadataItem: objectMetadataItemFromObjectMetadata } =
    useObjectMetadataItem({
      objectNameSingular: targetableObject.targetObjectNameSingular,
    });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);

  const modalRef = useRef<ModalRefType>(null);

  const availableFieldMetadataItems = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id,
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const { inlineFieldMetadataItems, relationFieldMetadataItems } = groupBy(
    availableFieldMetadataItems.filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'deletedAt' &&
        fieldMetadataItem.name !== 'address' &&
        fieldMetadataItem.name !== 'description',
    ),
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION
        ? 'relationFieldMetadataItems'
        : 'inlineFieldMetadataItems',
  );

  const subType = useSubcategoryByCategory(recordFromStore?.category);

  const relationsToShow = useMemo(() => {
    return relationFieldMetadataItems.filter(
      // Add relation fields to hide here
      (fieldMetadataItem) => fieldMetadataItem.name !== 'buyerLeads',
    );
  }, [relationFieldMetadataItems]);

  const rowsToShow = useMemo(() => {
    const finances = [];

    // Check Price Unit to show either price or rent
    if (
      recordFromStore?.priceUnit?.toLowerCase() === 'sell' ||
      recordFromStore?.priceUnit?.toLowerCase() === 'sell_square_meter'
    ) {
      finances.push('sellingPrice');
    } else {
      finances.push('rentNet', 'rentExtra');
    }

    const stage = isPrefetchLoading ? [] : ['stage'];
    // construct correct overview fields to show
    const base = [
      ...stage,
      'category',
      subType,
      'refProperty',
      'priceUnit',
      ...finances,
      'valuation',
      'rooms',
      'surface',
      'volume',
      'floor',
      'constructionYear',
      'renovationYear',
      'features',
    ];

    return base;
  }, [isPrefetchLoading, recordFromStore?.priceUnit, subType]);

  const isDefinedInRecord = (field: string) => {
    return (
      recordFromStore?.[field] !== undefined &&
      recordFromStore?.[field] !== null
    );
  };

  const mainDetails: FieldMetadataItem[] = [];
  // make sure all are defined pls
  rowsToShow.forEach((row) => {
    const fieldMetadata = inlineFieldMetadataItems.find(
      (fieldMetadataItem) => fieldMetadataItem.name === row,
    );
    if (fieldMetadata !== undefined) {
      mainDetails.push(fieldMetadata);
    }
  });

  // Use this for object cover images
  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: targetableObject.targetObjectNameSingular,
    objectRecordId: targetableObject.id,
    recordFromStore,
  });

  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file !== undefined && file !== null) {
      setUploadedFile(file);
      setIsLoading(true);

      // Simulate processing with a timeout
      setTimeout(() => {
        setIsLoading(false);
        setIsProcessed(true);
      }, 3000);
    }
  }, []);

  const handlePrefill = useCallback(() => {
    if (isDefined(recordFromStore)) {
      navigate(
        `${getLinkToShowPage(
          targetableObject.targetObjectNameSingular,
          recordFromStore,
        )}/edit`,
      );
    }
  }, [navigate, recordFromStore, targetableObject.targetObjectNameSingular]);

  // Reset the state when modal closes
  const handleModalClose = useCallback(() => {
    modalRef.current?.close();
  }, [modalRef]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxFiles: 1,
  });

  const overviewLabel =
    objectMetadataItem.nameSingular.charAt(0).toUpperCase() +
    objectMetadataItem.nameSingular.slice(1);

  if (isNewRightDrawerItemLoading || !isDefined(recordFromStore)) {
    return <ShowPageSummaryCardSkeletonLoader />;
  }

  const platformBadge = isPrefetchLoading ? (
    <PlatformBadge
      platformId={recordFromStore.platform ?? PlatformId.Newhome}
      isActive
    />
  ) : null;

  return (
    <StyledContainer>
      <PropertyBasicInfoCard record={recordFromStore} loading={recordLoading} />

      <PropertyImagesCard
        targetableObject={targetableObject}
        loading={recordLoading}
      />

      <PropertyDetailsCard
        record={recordFromStore}
        loading={recordLoading}
        objectMetadataItem={objectMetadataItem}
      />

      <PropertyAddressCard record={recordFromStore} loading={recordLoading} />

      <PropertyRelationsCard
        record={recordFromStore}
        loading={recordLoading}
        objectMetadataItem={objectMetadataItem}
      />

      <PropertyPublicationsCard
        record={recordFromStore}
        loading={recordLoading}
      />

      <Modal
        size="medium"
        onClose={handleModalClose}
        isClosable
        ref={modalRef}
        closedOnMount
        hotkeyScope={ModalHotkeyScope.Default}
        padding="none"
        portal
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconSparkles size={16} />
            <StyledModalTitle>
              <Trans>Prefill Property</Trans>
            </StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button title={t`Cancel`} Icon={IconX} onClick={handleModalClose} />
            {isProcessed && (
              <Button
                title={t`Prefill`}
                Icon={IconSparkles}
                accent="purple"
                onClick={handlePrefill}
              />
            )}
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>
          {uploadedFile && (
            <StyledDocumentContainer>
              <StyledDocumentInfo>
                <IconUpload size={16} />
                <StyledDocumentName>{uploadedFile.name}</StyledDocumentName>
              </StyledDocumentInfo>
              {isLoading ? (
                <CircularProgressBar size={16} barWidth={2} />
              ) : (
                isProcessed && <IconCheck size={16} color="green" />
              )}
            </StyledDocumentContainer>
          )}
          <StyledModalDescription>
            <Trans>
              <StyledNesterColored>Nester</StyledNesterColored> will analyze
              available data and suggest values for empty fields.
            </Trans>
          </StyledModalDescription>

          <StyledDropZoneContainer
            onClick={getRootProps().onClick}
            onKeyDown={getRootProps().onKeyDown}
            onFocus={getRootProps().onFocus}
            onBlur={getRootProps().onBlur}
            onDragEnter={getRootProps().onDragEnter}
            onDragOver={getRootProps().onDragOver}
            onDragLeave={getRootProps().onDragLeave}
            onDrop={getRootProps().onDrop}
            role="presentation"
          >
            <input
              type="file"
              onChange={getInputProps().onChange}
              onFocus={getInputProps().onFocus}
              onBlur={getInputProps().onBlur}
              accept={getInputProps().accept}
              multiple={getInputProps().multiple}
              style={{ display: 'none' }}
            />
            <StyledDropZoneContent>
              <StyledUploadIcon size={32} />
              <StyledUploadTitle>
                {isDragActive ? t`Drop the file here` : t`Upload a file`}
              </StyledUploadTitle>
              <StyledUploadSubTitle>
                {isDragActive
                  ? t`Drop your file to start analyzing`
                  : t`Drag and drop your file here, or click to browse`}
              </StyledUploadSubTitle>
            </StyledDropZoneContent>
          </StyledDropZoneContainer>
        </StyledModalContent>
      </Modal>
    </StyledContainer>
  );
};

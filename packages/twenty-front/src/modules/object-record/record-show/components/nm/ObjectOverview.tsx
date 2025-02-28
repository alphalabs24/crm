import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineEntry } from '@/object-record/record-inline-cell/components/nm/RecordInlineEntry';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { ShowPagePropertySummaryCard } from '@/ui/layout/show-page/components/nm/ShowPagePropertySummaryCard';
import { ShowPageSummaryCardSkeletonLoader } from '@/ui/layout/show-page/components/ShowPageSummaryCardSkeletonLoader';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
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
  LARGE_DESKTOP_VIEWPORT,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated/graphql';
import { useSubcategoryByCategory } from '../../hooks/useSubcategoryByCategory';

const StyledFormBorder = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 800px;
  }
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

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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

export const requiredPublicationFields = ['agency'];

export const ObjectOverview = ({
  targetableObject,
  isInRightDrawer,
  isNewRightDrawerItemLoading,
  isPublication,
}: {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isNewRightDrawerItemLoading?: boolean;
  isInRightDrawer?: boolean;
  isPublication?: boolean;
}) => {
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

    const stage = isPublication ? [] : ['stage'];
    // construct correct overview fields to show
    const base = [
      ...stage,
      'category',
      subType,
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
  }, [isPublication, recordFromStore?.priceUnit, subType]);

  const isDefinedInRecord = (field: string) => {
    return (
      recordFromStore?.[field] !== undefined &&
      recordFromStore?.[field] !== null
    );
  };

  const mainDetails: FieldMetadataItem[] = [];
  const { t } = useLingui();
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

  const isMobile = useIsMobile() || isInRightDrawer;

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = useCallback(() => {
    modalRef.current?.close();
  }, [modalRef]);

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
    closeModal();
    if (isDefined(recordFromStore)) {
      navigate(
        `${getLinkToShowPage(
          targetableObject.targetObjectNameSingular,
          recordFromStore,
        )}/edit`,
      );
    }
  }, [
    closeModal,
    navigate,
    recordFromStore,
    targetableObject.targetObjectNameSingular,
  ]);

  // Reset the state when modal closes
  const handleModalClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

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
  return (
    <>
      <StyledFormBorder>
        {recordLoading ? (
          // TODO: Add skeleton loader
          <div>
            <Trans>Loading...</Trans>
          </div>
        ) : (
          <>
            <StyledHeader>
              <StyledTitle>
                <Trans>{overviewLabel} Overview</Trans>
              </StyledTitle>
              <StyledButtonContainer>
                {!isPublication ? (
                  <Button
                    title={t`Prefill`}
                    Icon={IconSparkles}
                    accent="purple"
                    onClick={openModal}
                  />
                ) : (
                  <PlatformBadge
                    platformId={recordFromStore.platform ?? PlatformId.Newhome}
                    isActive
                  />
                )}
              </StyledButtonContainer>
            </StyledHeader>
            <StyledContent>
              <ShowPagePropertySummaryCard
                date={recordFromStore.createdAt ?? ''}
                loading={isPrefetchLoading || recordLoading}
                title={
                  recordFromStore.name?.firstName
                    ? recordFromStore.name.firstName
                    : recordFromStore.name
                }
                description={recordFromStore.description}
                address={
                  recordFromStore.address &&
                  (recordFromStore.address.addressStreet1 ||
                    recordFromStore.address.addressCity)
                    ? `${recordFromStore.address?.addressStreet1 || ''} ${recordFromStore.address?.addressCity || ''} ${recordFromStore.address?.addressState || ''} ${recordFromStore.address?.addressPostcode || ''} ${recordFromStore.address?.addressCountry || ''}`
                    : undefined
                }
                isMobile={isMobile}
              />

              {relationFieldMetadataItems?.map((FieldMetadataitem, index) => (
                <>
                  <FieldContext.Provider
                    key={FieldMetadataitem.id + 'relation' + index}
                    value={{
                      recordId: targetableObject.id,
                      maxWidth: 200,
                      recoilScopeId: targetableObject.id + FieldMetadataitem.id,
                      isLabelIdentifier: false,

                      fieldDefinition:
                        formatFieldMetadataItemAsColumnDefinition({
                          field: FieldMetadataitem,
                          position: index,
                          objectMetadataItem,
                          showLabel: true,
                          labelWidth: 90,
                        }),
                      useUpdateRecord: useUpdateOneObjectRecordMutation,
                      hotkeyScope: InlineCellHotkeyScope.InlineCell,
                    }}
                  >
                    <RecordInlineEntry
                      key={FieldMetadataitem.id + 'relation' + index}
                      loading={recordLoading}
                      isRequired={
                        !isDefinedInRecord(FieldMetadataitem.name) &&
                        requiredPublicationFields.includes(
                          FieldMetadataitem.name,
                        )
                      }
                    />
                  </FieldContext.Provider>
                  {inlineFieldMetadataItems?.length === 0 ? (
                    index < relationFieldMetadataItems.length - 1 ? (
                      <StyledBottomBorder />
                    ) : null
                  ) : (
                    <StyledBottomBorder />
                  )}
                </>
              ))}

              {mainDetails?.map((fieldMetadataItem, index) => (
                <>
                  <FieldContext.Provider
                    key={fieldMetadataItem.id + 'inline' + index}
                    value={{
                      recordId: targetableObject.id,
                      maxWidth: 200,
                      recoilScopeId: targetableObject.id + fieldMetadataItem.id,
                      isLabelIdentifier: false,
                      fieldDefinition:
                        formatFieldMetadataItemAsColumnDefinition({
                          field: fieldMetadataItem,
                          position: index,
                          objectMetadataItem,
                          showLabel: true,
                          labelWidth: 90,
                        }),
                      useUpdateRecord: useUpdateOneObjectRecordMutation,
                      hotkeyScope: InlineCellHotkeyScope.InlineCell,
                    }}
                  >
                    <RecordInlineEntry
                      key={fieldMetadataItem.id + 'inline' + index}
                      loading={recordLoading}
                    />
                  </FieldContext.Provider>
                  {index < mainDetails.length - 1 && <StyledBottomBorder />}
                </>
              ))}
            </StyledContent>
          </>
        )}
        <Modal
          size="medium"
          onClose={handleModalClose}
          isClosable
          ref={modalRef}
          closedOnMount
          hotkeyScope={ModalHotkeyScope.Default}
          padding="none"
        >
          <StyledModalHeader>
            <StyledModalTitleContainer>
              <IconSparkles size={16} />
              <StyledModalTitle>
                <Trans>Prefill Property</Trans>
              </StyledModalTitle>
            </StyledModalTitleContainer>
            <StyledModalHeaderButtons>
              <Button
                title={t`Cancel`}
                Icon={IconX}
                onClick={handleModalClose}
              />
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
                  {isDragActive ? 'Drop the file here' : 'Upload a file'}
                </StyledUploadTitle>
                <StyledUploadSubTitle>
                  {isDragActive
                    ? 'Drop your file to start analyzing'
                    : 'Drag and drop your file here, or click to browse'}
                </StyledUploadSubTitle>
              </StyledDropZoneContent>
            </StyledDropZoneContainer>
          </StyledModalContent>
        </Modal>
      </StyledFormBorder>
    </>
  );
};

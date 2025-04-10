import { useNestermind } from '@/api/hooks/useNestermind';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import {
    Button,
    IconAlertCircle,
    IconCheck,
    IconExchange,
    IconLoader,
    IconPhoto,
    IconUpload,
    IconX,
    MOBILE_VIEWPORT,
    useIcons,
} from 'twenty-ui';
import { FieldDifference } from '../../hooks/useDraftPublishedDifferences';
import { ValidationResult } from '../../hooks/usePublicationValidation';
import {
    StyledModalContainer,
    StyledModalContent,
    StyledModalHeader,
    StyledModalHeaderButtons,
    StyledModalTitle,
    StyledModalTitleContainer,
} from './modal-components/ModalComponents';
import { PlatformId } from './types/Platform';

const StyledDifferenceItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: center;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledDifferenceHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValueComparison = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledValueColumn = styled.div<{ $isOld?: boolean; $isNew?: boolean }>`
  font-weight: ${({ $isNew }) => ($isNew ? 500 : 'normal')};
  min-width: 0;
  opacity: ${({ $isOld }) => ($isOld ? 0.7 : 1)};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  text-decoration: ${({ $isOld }) => ($isOld ? 'line-through' : 'none')};
`;

const StyledEmptyValue = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
`;

const StyledChangeIcon = styled.div<{ $type: 'old' | 'new' }>`
  align-items: center;
  color: ${({ theme, $type }) =>
    $type === 'old' ? theme.color.red : theme.color.blue};
  display: flex;
  justify-content: center;
`;

const StyledModalDescription = styled.div`
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => `0 ${theme.spacing(2)} ${theme.spacing(4)}`};
`;

const StyledModalWarningText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.warning};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledModalTopTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
`;

const StyledColumnHeaders = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledHeaderColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledColumnTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledColumnSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledDiffViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledPlatformBadgeContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledValidationError = styled.div`
  background: ${({ theme }) => theme.color.red10};
  border: 1px solid ${({ theme }) => theme.color.red20};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.danger};
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledEditLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledSuccessMessage = styled.div`
  background: ${({ theme }) => theme.color.green10};
  border: 1px solid ${({ theme }) => theme.color.green20};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.green};
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledImageContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledErrorImage = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  height: 100px;
  justify-content: center;
  width: 150px;
`;

const StyledImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledImageCard = styled.div`
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  position: relative;
  max-width: 80px;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledImageCount = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
`;

const StyledNoImages = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;

  width: 100%;
  height: 100%;
`;

type PublicationDifferencesModalProps = {
  draftId: string;
  publishedId: string;
  differences: FieldDifference[];
  platform: string;
  onClose: () => void;
  onPublish?: () => void;
  isOpen?: boolean;
  validationDetails: ValidationResult;
};

export const PublicationDifferencesModal = forwardRef<
  ModalRefType,
  PublicationDifferencesModalProps
>(
  (
    {
      draftId,
      publishedId,
      differences,
      platform,
      onClose,
      onPublish,
      isOpen,
      validationDetails,
    },
    ref,
  ) => {
    const { t } = useLingui();
    const theme = useTheme();
    const { getIcon } = useIcons();
    const { enqueueSnackBar } = useSnackBar();
    const [showValidationError, setShowValidationError] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const { objectMetadataItem } = useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Publication,
    });

    const setDraftFields = useSetRecoilState(recordStoreFamilyState(draftId));
    const setPublishedFields = useSetRecoilState(
      recordStoreFamilyState(publishedId),
    );

    const {
      record: draftRecord,
      loading: loadingDraft,
      refetch: refetchDraft,
    } = useFindOneRecord({
      objectRecordId: draftId,
      objectNameSingular: CoreObjectNameSingular.Publication,
    });

    const {
      record: publishedRecord,
      loading: loadingPublished,
      refetch: refetchPublished,
    } = useFindOneRecord({
      objectRecordId: publishedId,
      objectNameSingular: CoreObjectNameSingular.Publication,
    });

    const { useMutations } = useNestermind();

    // Using the mutation hook for publish
    const { mutate: publishPublication } = useMutations.usePublishPublication({
      onSuccess: () => {
        setIsPublished(true);
        setIsPublishing(false);
        enqueueSnackBar(t`Publication published successfully`, {
          variant: SnackBarVariant.Success,
        });
        refetchDraft();
        refetchPublished();
      },
      onError: (error: Error) => {
        setIsPublishing(false);
        enqueueSnackBar(error?.message || t`Failed to publish`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

    const handlePublishClick = () => {
      if (validationDetails?.missingFields?.length > 0) {
        setShowValidationError(true);
        return;
      }

      setIsPublishing(true);
      publishPublication({ publicationId: draftId });
      if (onPublish) {
        onPublish();
      }
    };

    const isValueEmpty = (value: unknown): boolean =>
      value === null || value === undefined || value === '' || value === 0;

    useEffect(() => {
      if (draftRecord) {
        setDraftFields(draftRecord);
      }
    }, [draftRecord, setDraftFields]);

    useEffect(() => {
      if (publishedRecord) {
        setPublishedFields(publishedRecord);
      }
    }, [publishedRecord, setPublishedFields]);

    // We use effect to open/close the modal when isOpen changes
    useEffect(() => {
      if (isOpen && ref && 'current' in ref && ref.current) {
        ref.current.open();
      } else if (!isOpen && ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    }, [isOpen, ref]);

    const EmptyValueDisplay = () => (
      <StyledEmptyValue>
        <Trans>Empty</Trans>
      </StyledEmptyValue>
    );

    // Image with error fallback
    const ImageWithFallback = ({
      src,
      alt = 'Image',
      className,
    }: {
      src: string;
      alt?: string;
      className?: string;
    }) => {
      const [hasError, setHasError] = useState(false);

      const handleError = useCallback(() => {
        setHasError(true);
      }, []);

      if (hasError) {
        return (
          <StyledErrorImage>
            <IconAlertCircle size={16} />
          </StyledErrorImage>
        );
      }

      return (
        <StyledImage
          src={src}
          alt={alt}
          className={className}
          onError={handleError}
        />
      );
    };

    // Component to display images grid
    const ImagesGrid = ({ images }: { images: any[] }) => {
      if (!images || images.length === 0) {
        return (
          <StyledNoImages>
            <IconPhoto size={24} />
          </StyledNoImages>
        );
      }

      // Show up to 4 images + count
      const displayImages = images.slice(0, 3);
      const hasMoreImages = images.length > 3;

      return (
        <StyledImagesGrid>
          {displayImages.map((image, index) => (
            <StyledImageCard key={image.id || index}>
              <ImageWithFallback
                src={image.fullPath}
                alt={`Image ${index + 1}`}
              />
              {index === 2 && hasMoreImages && (
                <StyledImageCount>+{images.length - 3}</StyledImageCount>
              )}
            </StyledImageCard>
          ))}
        </StyledImagesGrid>
      );
    };

    // Custom component for displaying attachment differences
    const AttachmentDifference = ({ diff }: { diff: FieldDifference }) => {
      // For now, only handle images (extendable for documents later)
      if (diff.key === 'images') {
        return (
          <StyledDifferenceItem>
            <StyledDifferenceHeader>
              <IconPhoto size={14} />
              {diff.fieldLabel}
            </StyledDifferenceHeader>
            <StyledValueComparison>
              <StyledValueColumn $isOld>
                {loading ? (
                  <Skeleton
                    height={100}
                    width="100%"
                    highlightColor={theme.background.secondary}
                    baseColor={theme.background.tertiary}
                  />
                ) : (
                  <ImagesGrid images={diff.publishedValue || []} />
                )}
              </StyledValueColumn>

              <StyledValueColumn $isNew>
                {loading ? (
                  <Skeleton
                    height={100}
                    width="100%"
                    highlightColor={theme.background.secondary}
                    baseColor={theme.background.tertiary}
                  />
                ) : (
                  <ImagesGrid
                    images={diff.draftValue || []}
                    emptyMessage={t`No images in draft`}
                  />
                )}
              </StyledValueColumn>
            </StyledValueComparison>
          </StyledDifferenceItem>
        );
      }

      // Default fallback for unknown custom diff types
      return undefined;
    };

    const loading = loadingDraft || loadingPublished;

    return (
      <Modal
        onClose={onClose}
        isClosable
        ref={ref}
        closedOnMount
        padding="none"
        portal
        size="large"
      >
        <StyledModalContainer>
          <StyledModalHeader>
            <StyledModalTitleContainer>
              <IconExchange size={16} />
              <StyledModalTitle>{t`Review Changes`}</StyledModalTitle>
            </StyledModalTitleContainer>
            <StyledModalHeaderButtons>
              <Button
                variant="tertiary"
                title={isPublished ? t`Done` : t`Cancel`}
                onClick={onClose}
              />
              {!isPublished && (
                <Button
                  variant="primary"
                  accent="blue"
                  title={t`Publish Changes`}
                  onClick={handlePublishClick}
                  Icon={isPublishing ? IconLoader : IconUpload}
                  disabled={isPublishing}
                />
              )}
            </StyledModalHeaderButtons>
          </StyledModalHeader>

          <StyledModalContent>
            <StyledModalTopTitle>
              {t`Publication Changes to Publish`}
            </StyledModalTopTitle>
            <StyledModalDescription>
              {t`Review the changes that will be published. These changes will update the published version of your property listing.`}
            </StyledModalDescription>

            {showValidationError &&
              validationDetails?.missingFields?.length > 0 && (
                <StyledValidationError>
                  <IconAlertCircle size={16} />
                  {validationDetails.message}
                  <StyledEditLink
                    to={
                      validationDetails?.path ??
                      `${getLinkToShowPage(CoreObjectNameSingular.Publication, { id: draftId })}/edit`
                    }
                  >
                    {t`Edit`}
                  </StyledEditLink>
                </StyledValidationError>
              )}

            {isPublished && (
              <StyledSuccessMessage>
                <IconCheck size={16} />
                {t`Your changes have been published successfully.`}
              </StyledSuccessMessage>
            )}

            <StyledDiffViewContainer>
              <StyledColumnHeaders>
                <StyledPlatformBadgeContainer>
                  Platform
                  <PlatformBadge
                    platformId={(platform as PlatformId) || PlatformId.Newhome}
                    size="small"
                  />
                </StyledPlatformBadgeContainer>
                <StyledHeaderColumns>
                  <StyledColumnHeader>
                    <div>
                      <StyledColumnTitle>
                        <StyledChangeIcon $type="old">
                          <IconX size={16} />
                        </StyledChangeIcon>
                        {t`Currently Published`}
                      </StyledColumnTitle>
                      <StyledColumnSubtitle>{t`Will be replaced`}</StyledColumnSubtitle>
                    </div>
                  </StyledColumnHeader>
                  <StyledColumnHeader>
                    <div>
                      <StyledColumnTitle>
                        <StyledChangeIcon $type="new">
                          <IconCheck size={16} />
                        </StyledChangeIcon>
                        {t`New Draft Values`}
                      </StyledColumnTitle>
                      <StyledColumnSubtitle>{t`Will be published`}</StyledColumnSubtitle>
                    </div>
                  </StyledColumnHeader>
                </StyledHeaderColumns>
              </StyledColumnHeaders>

              {/* Display custom differences (images, documents) first */}
              {differences
                .filter((diff) => diff.isCustomDiff)
                .map((diff, index) => (
                  <AttachmentDifference
                    key={`custom-diff-${diff.key}-${index}`}
                    diff={diff}
                  />
                ))}

              {/* Display regular field differences */}
              {differences
                .filter((diff) => !diff.isCustomDiff)
                .map((diff, index) => {
                  const FieldIcon = getIcon(diff.fieldMetadataItem?.icon);

                  if (!diff.fieldMetadataItem) {
                    return null;
                  }

                  const isOldValueEmpty = isValueEmpty(diff.publishedValue);
                  const isNewValueEmpty = isValueEmpty(diff.draftValue);

                  return (
                    <StyledDifferenceItem
                      key={`field-diff-${diff.key}-${index}`}
                    >
                      <StyledDifferenceHeader>
                        <FieldIcon size={14} />
                        {diff.fieldLabel}
                      </StyledDifferenceHeader>
                      <StyledValueComparison>
                        <StyledValueColumn $isOld>
                          <RecordFieldValueSelectorContextProvider>
                            <RecordValueSetterEffect recordId={publishedId} />
                            {loading ? (
                              <Skeleton
                                height={12}
                                width={100}
                                highlightColor={theme.background.secondary}
                                baseColor={theme.background.tertiary}
                              />
                            ) : isOldValueEmpty ? (
                              <EmptyValueDisplay />
                            ) : (
                              <FieldContext.Provider
                                value={{
                                  recordId: publishedId,
                                  isLabelIdentifier: false,
                                  fieldDefinition: {
                                    type: diff.fieldMetadataItem.type,
                                    iconName:
                                      diff.fieldMetadataItem.icon ||
                                      'FieldIcon',
                                    fieldMetadataId:
                                      diff.fieldMetadataItem.id || '',
                                    label: diff.fieldMetadataItem.label,
                                    metadata: {
                                      fieldName: diff.fieldMetadataItem.name,
                                      objectMetadataNameSingular:
                                        objectMetadataItem.nameSingular,
                                      options:
                                        diff.fieldMetadataItem.options ?? [],
                                    },
                                    defaultValue:
                                      diff.fieldMetadataItem.defaultValue,
                                  },
                                  hotkeyScope: 'publication-diff',
                                }}
                              >
                                <FieldDisplay wrap />
                              </FieldContext.Provider>
                            )}
                          </RecordFieldValueSelectorContextProvider>
                        </StyledValueColumn>

                        <StyledValueColumn $isNew>
                          <RecordFieldValueSelectorContextProvider>
                            <RecordValueSetterEffect recordId={draftId} />
                            {loading ? (
                              <Skeleton
                                height={12}
                                width={100}
                                highlightColor={theme.background.secondary}
                                baseColor={theme.background.tertiary}
                              />
                            ) : isNewValueEmpty ? (
                              <EmptyValueDisplay />
                            ) : (
                              <FieldContext.Provider
                                value={{
                                  recordId: draftId,
                                  isLabelIdentifier: false,
                                  fieldDefinition: {
                                    type: diff.fieldMetadataItem.type,
                                    iconName:
                                      diff.fieldMetadataItem.icon ||
                                      'FieldIcon',
                                    fieldMetadataId:
                                      diff.fieldMetadataItem.id || '',
                                    label: diff.fieldMetadataItem.label,
                                    metadata: {
                                      fieldName: diff.fieldMetadataItem.name,
                                      objectMetadataNameSingular:
                                        objectMetadataItem.nameSingular,
                                      options:
                                        diff.fieldMetadataItem.options ?? [],
                                    },
                                    defaultValue:
                                      diff.fieldMetadataItem.defaultValue,
                                  },
                                  hotkeyScope: 'publication-diff',
                                }}
                              >
                                <FieldDisplay wrap />
                              </FieldContext.Provider>
                            )}
                          </RecordFieldValueSelectorContextProvider>
                        </StyledValueColumn>
                      </StyledValueComparison>
                    </StyledDifferenceItem>
                  );
                })}
            </StyledDiffViewContainer>

            <StyledModalWarningText>
              <IconAlertCircle size={12} />
              <Trans>
                These changes will update your published listing immediately.
                Make sure all details are correct before proceeding.
              </Trans>
            </StyledModalWarningText>
          </StyledModalContent>
        </StyledModalContainer>
      </Modal>
    );
  },
);

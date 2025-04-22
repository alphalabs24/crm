import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useTutorial } from '@/onboarding-tutorial/contexts/TutorialProvider';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSetRecoilState } from 'recoil';
import { UserTutorialExplanation } from 'twenty-shared';
import {
  Button,
  IconAlertCircle,
  IconCheck,
  IconExchange,
  IconHelpCircle,
  IconHome,
  IconHomeShare,
  IconPencil,
  IconRefresh,
  IconUpload,
  IconX,
  MOBILE_VIEWPORT,
  useIcons,
} from 'twenty-ui';
import {
  PropertyPublicationDifference,
  PublicationDifferences,
} from '../../hooks/usePropertyAndPublicationDifferences';
import {
  StyledModalContainer,
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from './modal-components/ModalComponents';
import { PlatformId, PLATFORMS } from './types/Platform';

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
  padding: 0 ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(4)};
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

const StyledPublicationTabs = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(0)};
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  max-width: fit-content;
  overflow-x: auto;
  scroll-behavior: smooth;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledPublicationTab = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: none;
  background: ${({ theme, isActive }) =>
    isActive ? theme.background.primary : 'transparent'};
  cursor: pointer;
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  transition: all 150ms ease-in-out;
  position: relative;
  padding: ${({ theme }) => theme.spacing(1.5)}
    ${({ theme }) => theme.spacing(3)};

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? theme.background.primary : theme.background.quaternary};
  }

  ${({ isActive, theme }) =>
    isActive && `box-shadow: ${theme.boxShadow.light};`}
`;

const StyledDiffCount = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};

  text-align: center;
`;

const StyledPlatformIcon = styled.div<{ platform: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  svg {
    color: ${({ theme, platform }) => {
      switch (platform.toLowerCase()) {
        case 'airbnb':
          return theme.color.red;
        case 'booking':
          return theme.color.blue;
        default:
          return theme.font.color.secondary;
      }
    }};
  }
`;

const StyledTabsContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledHelpButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.md};
  padding: 0;
  gap: ${({ theme }) => theme.spacing(1)};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
    cursor: pointer;
  }
`;

type PropertyDifferencesModalProps = {
  differences: PublicationDifferences[];
  onClose: () => void;
  onSync?: () => void;
  onSyncAndPublish?: () => void;
  loadingSync?: boolean;
  loadingSyncAndPublish?: boolean;
  propertyRecordId: string;
  publicationRecordId: string;
};

const PublicationDiffView = ({
  differences,
  propertyRecordId,
  publicationRecordId,
}: {
  differences: PropertyPublicationDifference[];
  propertyRecordId: string;
  publicationRecordId: string;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });
  const { objectMetadataItem: propertyMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const setEntityFields = useSetRecoilState(
    recordStoreFamilyState(publicationRecordId),
  );

  const { record, loading } = useFindOneRecord({
    objectRecordId: publicationRecordId,
    objectNameSingular: CoreObjectNameSingular.Publication,
  });

  const isValueEmpty = (value: unknown): boolean =>
    value === null || value === undefined || value === '' || value === 0;

  useEffect(() => {
    if (record) {
      setEntityFields(record);
    }
  }, [record, setEntityFields]);

  const EmptyValueDisplay = () => (
    <StyledEmptyValue>
      <Trans>Empty</Trans>
    </StyledEmptyValue>
  );

  return (
    <StyledDiffViewContainer>
      <StyledColumnHeaders>
        <div />
        <StyledHeaderColumns>
          <StyledColumnHeader>
            <IconHomeShare size={16} />
            <div>
              <StyledColumnTitle>
                <StyledChangeIcon $type="old">
                  <IconX size={16} />
                </StyledChangeIcon>
                {t`Old Values`}
              </StyledColumnTitle>
              <StyledColumnSubtitle>{t`Will be replaced`}</StyledColumnSubtitle>
            </div>
          </StyledColumnHeader>
          <StyledColumnHeader>
            <IconHome size={16} />
            <div>
              <StyledColumnTitle>
                <StyledChangeIcon $type="new">
                  <IconCheck size={16} />
                </StyledChangeIcon>
                {t`New Values`}
              </StyledColumnTitle>
              <StyledColumnSubtitle>{t`Will be applied`}</StyledColumnSubtitle>
            </div>
          </StyledColumnHeader>
        </StyledHeaderColumns>
      </StyledColumnHeaders>

      {differences.map((diff, index) => {
        const PublicationIcon = getIcon(
          diff.publicationFieldMetadataItem?.icon,
        );

        if (
          !diff.propertyFieldMetadataItem ||
          !diff.publicationFieldMetadataItem
        ) {
          return null;
        }

        const isOldValueEmpty = isValueEmpty(diff.publicationValue);
        const isNewValueEmpty = isValueEmpty(diff.propertyValue);

        const isObject =
          typeof diff.publicationValue === 'object' ||
          typeof diff.propertyValue === 'object';

        return (
          <StyledDifferenceItem key={index}>
            <StyledDifferenceHeader>
              <PublicationIcon size={14} />
              {diff.fieldLabel}
            </StyledDifferenceHeader>
            <StyledValueComparison>
              <StyledValueColumn $isOld>
                <RecordFieldValueSelectorContextProvider>
                  <RecordValueSetterEffect recordId={publicationRecordId} />
                  {loading ? (
                    <Skeleton
                      height={12}
                      width={100}
                      highlightColor={theme.background.secondary}
                      baseColor={theme.background.tertiary}
                    />
                  ) : isOldValueEmpty ? (
                    <EmptyValueDisplay />
                  ) : (isObject && diff.publicationValue.name) ||
                    diff.publicationValue.title ? (
                    <div>
                      <RecordChip
                        record={diff.publicationValue}
                        objectNameSingular={
                          diff.publicationValue.__typename?.toLowerCase() ?? ''
                        }
                        disabled
                      />
                    </div>
                  ) : (
                    <FieldContext.Provider
                      value={{
                        recordId: publicationRecordId,
                        isLabelIdentifier: false,
                        fieldDefinition: {
                          type: diff.publicationFieldMetadataItem.type,
                          iconName:
                            diff.publicationFieldMetadataItem.icon ||
                            'FieldIcon',
                          fieldMetadataId:
                            diff.publicationFieldMetadataItem.id || '',
                          label: diff.publicationFieldMetadataItem.label,
                          metadata: {
                            fieldName: diff.publicationFieldMetadataItem.name,
                            objectMetadataNameSingular:
                              objectMetadataItem.nameSingular,
                            options:
                              diff.publicationFieldMetadataItem.options ?? [],
                          },
                          defaultValue:
                            diff.publicationFieldMetadataItem.defaultValue,
                        },
                        hotkeyScope: 'property-diff',
                      }}
                    >
                      <FieldDisplay wrap />
                    </FieldContext.Provider>
                  )}
                </RecordFieldValueSelectorContextProvider>
              </StyledValueColumn>

              <StyledValueColumn $isNew>
                {loading ? (
                  <Skeleton
                    height={12}
                    width={100}
                    highlightColor={theme.background.secondary}
                    baseColor={theme.background.tertiary}
                  />
                ) : isNewValueEmpty ? (
                  <EmptyValueDisplay />
                ) : (isObject && diff.propertyValue.name) ||
                  diff.propertyValue.title ? (
                  <div>
                    <RecordChip
                      record={diff.propertyValue}
                      objectNameSingular={
                        diff.propertyValue.__typename?.toLowerCase() ?? ''
                      }
                      disabled
                    />
                  </div>
                ) : (
                  <FieldContext.Provider
                    value={{
                      overridenIsFieldEmpty: isValueEmpty(diff.propertyValue),
                      recordId: propertyRecordId,
                      isLabelIdentifier: false,
                      fieldDefinition: {
                        type: diff.propertyFieldMetadataItem.type,
                        iconName:
                          diff.propertyFieldMetadataItem.icon || 'FieldIcon',
                        fieldMetadataId:
                          diff.propertyFieldMetadataItem.id || '',
                        label: diff.propertyFieldMetadataItem.label,
                        metadata: {
                          fieldName: diff.propertyFieldMetadataItem.name,
                          objectMetadataNameSingular:
                            propertyMetadataItem?.nameSingular,
                          options: diff.propertyFieldMetadataItem.options ?? [],
                        },
                        defaultValue:
                          diff.propertyFieldMetadataItem.defaultValue,
                      },
                      hotkeyScope: 'property-diff',
                    }}
                  >
                    <FieldDisplay wrap />
                  </FieldContext.Provider>
                )}
              </StyledValueColumn>
            </StyledValueComparison>
          </StyledDifferenceItem>
        );
      })}
    </StyledDiffViewContainer>
  );
};

// Then modify the modal to handle multiple publications
export const PropertyDifferencesModal = forwardRef<
  ModalRefType,
  PropertyDifferencesModalProps
>(
  (
    {
      differences,
      onClose,
      onSync,
      onSyncAndPublish,
      propertyRecordId,
      loadingSync,
      loadingSyncAndPublish,
    },
    ref,
  ) => {
    const { t } = useLingui();
    const { showTutorial } = useTutorial();
    const [activePublicationIndex, setActivePublicationIndex] = useState(0);
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLButtonElement>(null);

    // Scroll active tab into view when it changes
    useEffect(() => {
      if (activeTabRef.current && tabsContainerRef.current) {
        const activeTab = activeTabRef.current;

        // Simply scroll the active tab into view with smooth behavior
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, [activePublicationIndex]);

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
              <StyledModalTitle>{t`Compare Changes`}</StyledModalTitle>
            </StyledModalTitleContainer>
            <StyledModalHeaderButtons>
              <Button
                variant="tertiary"
                title={t`Cancel`}
                onClick={onClose}
                disabled={loadingSync || loadingSyncAndPublish}
              />
              {onSync && (
                <Button
                  variant="primary"
                  title={t`Sync as Drafts`}
                  onClick={onSync}
                  Icon={IconPencil}
                  disabled={loadingSyncAndPublish}
                  loading={loadingSync}
                />
              )}
              {onSyncAndPublish && (
                <Button
                  variant="primary"
                  accent="blue"
                  title={t`Sync and Publish All`}
                  onClick={onSyncAndPublish}
                  Icon={IconUpload}
                  disabled={loadingSync}
                  loading={loadingSyncAndPublish}
                />
              )}
            </StyledModalHeaderButtons>
          </StyledModalHeader>

          <StyledModalContent>
            <StyledModalTopTitle>
              {t`Sync Drafts with Property`}
              <StyledHelpButton
                onClick={() =>
                  showTutorial(
                    UserTutorialExplanation.TUTORIAL_PUBLICATION_SYNC,
                  )
                }
              >
                <IconHelpCircle size={16} />
                <Trans>Learn more</Trans>
              </StyledHelpButton>
            </StyledModalTopTitle>
            <StyledModalDescription>
              {t`Review differences between your property and its publication drafts. Syncing will update the publication drafts with the current property values.`}
            </StyledModalDescription>
            <StyledTabsContainer>
              <StyledPublicationTabs ref={tabsContainerRef}>
                {differences.map((publicationDiff, index) => (
                  <StyledPublicationTab
                    key={publicationDiff.publicationId}
                    isActive={index === activePublicationIndex}
                    onClick={() => setActivePublicationIndex(index)}
                    ref={index === activePublicationIndex ? activeTabRef : null}
                  >
                    <StyledPlatformIcon platform={publicationDiff.platform}>
                      <PlatformBadge
                        size="small"
                        variant="no-background"
                        platformId={
                          (publicationDiff.platform as PlatformId) ??
                          PlatformId.Newhome
                        }
                      />
                    </StyledPlatformIcon>
                    {PLATFORMS[publicationDiff.platform as PlatformId]?.name}
                    <StyledDiffCount>
                      {publicationDiff.differences.length}
                    </StyledDiffCount>
                  </StyledPublicationTab>
                ))}
              </StyledPublicationTabs>
            </StyledTabsContainer>

            {differences[activePublicationIndex] && (
              <PublicationDiffView
                differences={differences[activePublicationIndex].differences}
                propertyRecordId={propertyRecordId}
                publicationRecordId={
                  differences[activePublicationIndex].publicationId
                }
              />
            )}
            <StyledModalWarningText>
              <IconAlertCircle size={12} />
              <Trans>
                Keep in mind that only nestermind drafts will be synchronized.
                You will need to publish the drafts manually after
                synchronization.
              </Trans>
            </StyledModalWarningText>
          </StyledModalContent>
        </StyledModalContainer>
      </Modal>
    );
  },
);

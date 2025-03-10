import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { forwardRef, useEffect, useState, useRef } from 'react';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import {
  PropertyPublicationDifference,
  PublicationDifferences,
} from '../../hooks/usePropertyAndPublicationDifferences';
import {
  IconExchange,
  Button,
  IconRefresh,
  useIcons,
  IconHomeShare,
  MOBILE_VIEWPORT,
} from 'twenty-ui';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSetRecoilState } from 'recoil';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { PlatformId, PLATFORMS } from './types/Platform';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import Skeleton from 'react-loading-skeleton';
import {
  StyledModalContainer,
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from './modal-components/ModalComponents';

const StyledDifferenceItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(4)};
  display: flex;
  position: relative;
  flex-wrap: wrap;
`;

const StyledDifferenceHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledValueComparison = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: 100%;
  position: relative;
  overflow: hidden;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    flex: 1;
  }
`;

const StyledValueColumn = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledArrowContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  justify-content: center;
`;

const StyledModalDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: 0 ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(4)};
`;

const StyledModalTopTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledColumnHeaders = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledNewTag = styled.div`
  color: ${({ theme }) => theme.color.blue40};
  width: fit-content;
  font-size: ${({ theme }) => theme.font.size.xs};
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
    isActive &&
    `
    box-shadow: ${theme.boxShadow.light};
  `}
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
  background: ${({ theme, platform }) => {
    switch (platform.toLowerCase()) {
      case 'airbnb':
        return theme.color.red10;
      case 'booking':
        return theme.color.blue10;
      default:
        return theme.background.quaternary;
    }
  }};

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

type PropertyDifferencesModalProps = {
  differences: PublicationDifferences[];
  onClose: () => void;
  onSync?: () => void;
  propertyRecordId: string;
  publicationRecordId: string;
};

// First create a new component for individual publication differences
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
  const { getIcon } = useIcons();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });
  const { objectMetadataItem: propertyMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  // Add missing Recoil state setup
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

  return (
    <StyledDiffViewContainer>
      <StyledColumnHeaders>
        <StyledColumnHeader>
          <IconHomeShare size={16} />
          <div>
            <StyledColumnTitle>{t`Old`}</StyledColumnTitle>
            <StyledColumnSubtitle>{t`Current draft values`}</StyledColumnSubtitle>
          </div>
        </StyledColumnHeader>
        <StyledArrowContainer>→</StyledArrowContainer>
        <StyledColumnHeader>
          <IconHomeShare size={16} />
          <div>
            <StyledColumnTitle>
              <StyledNewTag>{t`Updated`}</StyledNewTag>
            </StyledColumnTitle>
            <StyledColumnSubtitle>{t`Source values`}</StyledColumnSubtitle>
          </div>
        </StyledColumnHeader>
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

        return (
          <StyledDifferenceItem key={index}>
            <StyledDifferenceHeader>
              <PublicationIcon size={14} />
              {diff.fieldLabel}
            </StyledDifferenceHeader>
            <StyledValueComparison>
              <StyledValueColumn>
                <RecordFieldValueSelectorContextProvider>
                  <RecordValueSetterEffect recordId={publicationRecordId} />

                  {loading ? (
                    <Skeleton height={12} width={100} />
                  ) : (
                    <FieldContext.Provider
                      value={{
                        recordId: publicationRecordId,
                        isLabelIdentifier: isLabelIdentifierField({
                          fieldMetadataItem: diff.publicationFieldMetadataItem,
                          objectMetadataItem: objectMetadataItem,
                        }),
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

              <StyledArrowContainer>→</StyledArrowContainer>
              <StyledValueColumn>
                <div>
                  {loading ? (
                    <Skeleton height={12} width={100} />
                  ) : (
                    <FieldContext.Provider
                      value={{
                        overridenIsFieldEmpty: isValueEmpty(diff.propertyValue),
                        recordId: propertyRecordId,
                        isLabelIdentifier: isLabelIdentifierField({
                          fieldMetadataItem: diff.propertyFieldMetadataItem,
                          objectMetadataItem: propertyMetadataItem,
                        }),
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
                            options:
                              diff.propertyFieldMetadataItem.options ?? [],
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
                </div>
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
>(({ differences, onClose, onSync, propertyRecordId }, ref) => {
  const { t } = useLingui();
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
      size="large"
    >
      <StyledModalContainer>
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconExchange size={16} />
            <StyledModalTitle>{t`Compare Changes`}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
            {onSync && (
              <Button
                variant="primary"
                accent="blue"
                title={t`Sync All`}
                onClick={onSync}
                Icon={IconRefresh}
              />
            )}
          </StyledModalHeaderButtons>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledModalTopTitle>{t`Sync Drafts with Property`}</StyledModalTopTitle>
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
        </StyledModalContent>
      </StyledModalContainer>
    </Modal>
  );
});

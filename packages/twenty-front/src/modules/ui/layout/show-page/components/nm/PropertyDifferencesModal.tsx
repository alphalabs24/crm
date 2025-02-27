import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { forwardRef, useEffect } from 'react';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { motion } from 'framer-motion';
import { PropertyPublicationDifference } from '../../hooks/usePropertyAndPublicationDifferences';
import {
  IconArrowRight,
  IconExchange,
  Button,
  LARGE_DESKTOP_VIEWPORT,
  IconRefresh,
  useIcons,
  IconFileText,
  IconHome,
} from 'twenty-ui';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useSetRecoilState } from 'recoil';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { isDefined } from 'twenty-shared';

const StyledModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
`;

const StyledModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
  height: 100%;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  flex-shrink: 0;
`;

const StyledModalHeaderButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledModalTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledModalTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDifferenceItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(4)};
  display: flex;
`;

const StyledDifferenceHeader = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
`;

const StyledValueComparison = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;
`;

const StyledValueColumn = styled.div`
  flex: 1;
`;

const StyledArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledModalDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: 0 ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(4)};

  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
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

const NewTag = styled.div`
  color: ${({ theme }) => theme.color.blue};
  width: fit-content;
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const OldTag = styled.div`
  color: ${({ theme }) => theme.color.gray50};
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
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledColumnSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

type PropertyDifferencesModalProps = {
  differences: PropertyPublicationDifference[];
  onClose: () => void;
  onSync?: () => void;
  propertyRecordId: string;
  publicationRecordId: string;
};

export const PropertyDifferencesModal = forwardRef<
  ModalRefType,
  PropertyDifferencesModalProps
>(
  (
    { differences, onClose, onSync, propertyRecordId, publicationRecordId },
    ref,
  ) => {
    const { t } = useLingui();

    const { objectMetadataItem } = useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Publication,
    });
    const { objectMetadataItems } = useObjectMetadataItems();

    const setEntityFields = useSetRecoilState(
      recordStoreFamilyState(publicationRecordId),
    );
    // This is required in order to have publication data in recoil state
    const FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE =
      buildFindOneRecordForShowPageOperationSignature({
        objectMetadataItem,
        objectMetadataItems,
      });

    const { record, loading } = useFindOneRecord({
      objectRecordId: publicationRecordId,
      objectNameSingular: CoreObjectNameSingular.Publication,
      recordGqlFields: FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE.fields,
      withSoftDeleted: true,
    });

    const { getIcon } = useIcons();

    useEffect(() => {
      if (isDefined(record)) {
        setEntityFields(record);
      }
    }, [record, setEntityFields]);

    const isValueEmpty = (value: unknown): boolean =>
      value === null || value === undefined || value === '' || value === 0;

    if (loading) return null;
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

          <StyledModalContent
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <StyledModalTopTitle>
              {t`Sync Drafts with Property`}
            </StyledModalTopTitle>
            <StyledModalDescription>
              {t`Review differences between your property and its publication drafts. Syncing will update the publication drafts with the current property values.`}
            </StyledModalDescription>
            <StyledColumnHeaders>
              <StyledColumnHeader>
                <IconFileText size={16} />
                <div>
                  <StyledColumnTitle>
                    {t`Publication Draft`}
                    <OldTag>{t`(Old)`}</OldTag>
                  </StyledColumnTitle>
                  <StyledColumnSubtitle>{t`Current draft values`}</StyledColumnSubtitle>
                </div>
              </StyledColumnHeader>
              <StyledArrowContainer>→</StyledArrowContainer>
              <StyledColumnHeader>
                <IconHome size={16} />
                <div>
                  <StyledColumnTitle>
                    {t`Property`}
                    <NewTag>{t`(Updated)`}</NewTag>
                  </StyledColumnTitle>
                  <StyledColumnSubtitle>{t`Source values`}</StyledColumnSubtitle>
                </div>
              </StyledColumnHeader>
            </StyledColumnHeaders>

            {differences?.length === 0 ? (
              <div>{t`No differences found`}</div>
            ) : (
              differences?.map((diff, index) => {
                const PublicationIcon = getIcon(
                  diff.publicationFieldMetadataItem?.icon,
                );
                return (
                  diff.publicationFieldMetadataItem &&
                  diff.propertyFieldMetadataItem && (
                    <StyledDifferenceItem key={index}>
                      <StyledDifferenceHeader>
                        <PublicationIcon size={14} />
                        {diff.fieldLabel}
                      </StyledDifferenceHeader>
                      <StyledValueComparison>
                        <StyledValueColumn>
                          <div>
                            <RecordFieldValueSelectorContextProvider>
                              <RecordValueSetterEffect
                                recordId={publicationRecordId}
                              />
                              {isValueEmpty(diff.publicationValue) ? (
                                <div>{t`Empty`}</div>
                              ) : (
                                <FieldContext.Provider
                                  value={{
                                    recordId: publicationRecordId,
                                    isLabelIdentifier: isLabelIdentifierField({
                                      fieldMetadataItem:
                                        diff.publicationFieldMetadataItem,
                                      objectMetadataItem:
                                        diff.publicationMetadataItem,
                                    }),
                                    fieldDefinition: {
                                      type: diff.publicationFieldMetadataItem
                                        .type,
                                      iconName:
                                        diff.publicationFieldMetadataItem
                                          .icon || 'FieldIcon',
                                      fieldMetadataId:
                                        diff.publicationFieldMetadataItem.id ||
                                        '',
                                      label:
                                        diff.publicationFieldMetadataItem.label,
                                      metadata: {
                                        fieldName:
                                          diff.publicationFieldMetadataItem
                                            .name,
                                        objectMetadataNameSingular:
                                          diff.publicationMetadataItem
                                            ?.nameSingular,
                                        options:
                                          diff.publicationFieldMetadataItem
                                            .options ?? [],
                                      },
                                      defaultValue:
                                        diff.publicationFieldMetadataItem
                                          .defaultValue,
                                    },
                                    hotkeyScope: 'publication-diff',
                                  }}
                                >
                                  <FieldDisplay wrap />
                                </FieldContext.Provider>
                              )}
                            </RecordFieldValueSelectorContextProvider>
                          </div>
                        </StyledValueColumn>
                        <StyledArrowContainer>→</StyledArrowContainer>
                        <StyledValueColumn>
                          <div>
                            {isValueEmpty(diff.propertyValue) ? (
                              <div>{t`Empty`}</div>
                            ) : (
                              <FieldContext.Provider
                                value={{
                                  overridenIsFieldEmpty: isValueEmpty(
                                    diff.propertyValue,
                                  ),
                                  recordId: propertyRecordId,
                                  isLabelIdentifier: isLabelIdentifierField({
                                    fieldMetadataItem:
                                      diff.propertyFieldMetadataItem,
                                    objectMetadataItem:
                                      diff.propertyMetadataItem,
                                  }),
                                  fieldDefinition: {
                                    type: diff.propertyFieldMetadataItem.type,
                                    iconName:
                                      diff.propertyFieldMetadataItem.icon ||
                                      'FieldIcon',
                                    fieldMetadataId:
                                      diff.propertyFieldMetadataItem.id || '',
                                    label: diff.propertyFieldMetadataItem.label,
                                    metadata: {
                                      fieldName:
                                        diff.propertyFieldMetadataItem.name,
                                      objectMetadataNameSingular:
                                        diff.propertyMetadataItem?.nameSingular,
                                      options:
                                        diff.propertyFieldMetadataItem
                                          .options ?? [],
                                    },
                                    defaultValue:
                                      diff.propertyFieldMetadataItem
                                        .defaultValue,
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
                  )
                );
              })
            )}
          </StyledModalContent>
        </StyledModalContainer>
      </Modal>
    );
  },
);

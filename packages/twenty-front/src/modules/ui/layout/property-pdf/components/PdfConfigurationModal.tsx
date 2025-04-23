import { useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { forwardRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import {
  StyledModalContainer as BaseModalContainer,
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from '@/ui/layout/show-page/components/nm/modal-components/ModalComponents';
import {
  Button,
  IconCheck,
  IconFile,
  IconSettings,
  IconPhoto,
  IconListCheck,
  MOBILE_VIEWPORT,
  IconChevronDown,
  IconBuildingSkyscraper,
  IconMail,
  IconPhone,
} from 'twenty-ui';
import { useSubcategoryByCategory } from '@/object-record/record-show/hooks/useSubcategoryByCategory';
import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { PropertyPdfPreview, fieldsToShowOnPdf } from './PropertyPdfPreview';
import { PdfConfiguration, PropertyPdfType } from '../types/types';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import { usePropertyImages } from '../../show-page/hooks/usePropertyImages';

// Extended modal container with minimum height
const StyledModalContainer = styled(BaseModalContainer)`
  min-height: 80vh;
`;

const StyledFieldCard = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1.5)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledFieldLabelContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const StyledFieldLabel = styled.span<{ isSelected: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledFieldsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledModalLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(4)};
  flex: 1;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledOptionCard = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledOptionCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledOptionContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledOptionDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledOptionIcon = styled.div<{ isSelected: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.font.color.secondary};
  display: flex;
`;

const StyledOptionLabel = styled.span<{ isSelected: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledOptionsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledOptionsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing(2)};
  flex: 0.3;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    padding-right: 0;
  }
`;

const StyledPreviewContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  flex: 1;
  height: 500px;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: 400px;
  }
`;

const StyledPreviewPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledSectionDivider = styled.div`
  background-color: ${({ theme }) => theme.border.color.light};
  height: 1px;
  margin: ${({ theme }) => theme.spacing(3)} 0;
  width: 100%;
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

const StyledSectionContent = styled(motion.div)`
  overflow: hidden;
`;

const StyledChevron = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSectionTitle = styled.h4`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledSelectionOrder = styled.div`
  align-items: center;
  border-radius: 50%;
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledOptionCardContent = styled.div<{ $disabled?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

const StyledOptionIconContainer = styled.div`
  display: flex;
`;

const StyledOptionsInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledOptionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export type PdfConfigurationModalProps = {
  property: ObjectRecord;
  pdfType: PropertyPdfType;
  onClose: () => void;
  onGenerate: (config: PdfConfiguration) => Promise<void>;
  isGenerating?: boolean;
};

// Collapsible section component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();

  return (
    <>
      <StyledSectionHeader
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {title}
        {(isHovering || !isOpen) && (
          <StyledChevron
            animate={{ rotate: isOpen ? 0 : -90, opacity: 1 }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0 }}
          >
            <IconChevronDown size={18} color={theme.font.color.secondary} />
          </StyledChevron>
        )}
      </StyledSectionHeader>
      <AnimatePresence initial={false}>
        {isOpen && (
          <StyledSectionContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </StyledSectionContent>
        )}
      </AnimatePresence>
    </>
  );
};

export const PdfConfigurationModal = forwardRef<
  ModalRefType,
  PdfConfigurationModalProps
>(({ property, pdfType, onClose, onGenerate, isGenerating = false }, ref) => {
  const { t } = useLingui();
  const [localIsGenerating, setLocalIsGenerating] = useState(false);

  // TODO Refactor this to never use workspace logo but use the agency logo once available
  const [currentWorkspace] = useRecoilState(currentWorkspaceState);

  const images = usePropertyImages({
    id: property.id,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  const hasMultipleImages = (images?.length || 0) > 1;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  // Use either the external or local loading state
  const effectiveIsGenerating = isGenerating || localIsGenerating;

  // Get the category from property to filter relevant fields
  const propertyCategory = property?.category as string | undefined;
  const subcategory = useSubcategoryByCategory(propertyCategory);

  // Filter fields based on property category and subtype
  const relevantFields = useMemo(() => {
    // Start with the basic fields without subtypes
    const baseFields = fieldsToShowOnPdf.filter(
      (field) => !Object.values(CATEGORY_SUBTYPES).includes(field as any),
    );

    // If we don't have a valid subcategory, return only base fields
    if (!subcategory) {
      return baseFields;
    }

    // Get the category key from the subcategory (remove "Subtype" suffix and convert to uppercase)
    const categoryKey = subcategory
      .replace('Subtype', '')
      .toUpperCase() as keyof typeof CATEGORY_SUBTYPES;

    // Check if the category key is valid
    if (CATEGORY_SUBTYPES[categoryKey]) {
      return [...baseFields, CATEGORY_SUBTYPES[categoryKey]];
    }

    return baseFields;
  }, [subcategory]);

  // Configuration state
  const [config, setConfig] = useState<PdfConfiguration>({
    showAllImages: true,
    includeFeatures: true,
    selectedFields: [...relevantFields],
    orientation: 'portrait',
    // Publisher options - default all to true
    showPublisherBranding: true,
    showPublisherEmail: true,
    showPublisherPhone: true,
  });

  // Update selected fields when relevantFields change
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      selectedFields: [...relevantFields],
    }));
  }, [relevantFields]);

  // Disable showAllImages if there aren't multiple images
  useEffect(() => {
    if (!hasMultipleImages && config.showAllImages) {
      setConfig((prev) => ({
        ...prev,
        showAllImages: false,
      }));
    }
  }, [hasMultipleImages, config.showAllImages]);

  // Disable publisher options when related data is not available
  useEffect(() => {
    const hasAgencyName = !!property?.agency?.name;
    const hasAgencyEmail = !!property?.agency?.email?.primaryEmail;
    const hasAgencyPhone = !!property?.agency?.phone?.primaryPhone;
    const hasWorkspaceLogo = !!currentWorkspace?.logo;

    const updates: Partial<PdfConfiguration> = {};

    if ((!hasAgencyName || !hasWorkspaceLogo) && config.showPublisherBranding) {
      updates.showPublisherBranding = false;
    }

    if (!hasAgencyEmail && config.showPublisherEmail) {
      updates.showPublisherEmail = false;
    }

    if (!hasAgencyPhone && config.showPublisherPhone) {
      updates.showPublisherPhone = false;
    }

    if (Object.keys(updates).length > 0) {
      setConfig((prev) => ({
        ...prev,
        ...updates,
      }));
    }
  }, [
    property?.agency,
    currentWorkspace?.logo,
    config.showPublisherBranding,
    config.showPublisherEmail,
    config.showPublisherPhone,
  ]);

  const toggleField = (field: string) => {
    setConfig((prev) => {
      if (prev.selectedFields.includes(field)) {
        return {
          ...prev,
          selectedFields: prev.selectedFields.filter((f) => f !== field),
        };
      } else {
        return {
          ...prev,
          selectedFields: [...prev.selectedFields, field],
        };
      }
    });
  };

  // Handler for generating PDF with current config
  const handleGeneratePdf = useCallback(async () => {
    setLocalIsGenerating(true);
    try {
      // Create a deep copy of the config to prevent any reference issues
      const configCopy = {
        ...config,
        selectedFields: [...config.selectedFields],
      };

      await onGenerate(configCopy);
      // Close the modal after successful generation
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLocalIsGenerating(false);
    }
  }, [config, onGenerate, onClose]);

  // Publisher Information Section
  const renderPublisherInformationSection = () => {
    const hasAgencyName = !!property?.agency?.name;
    const hasAgencyEmail = !!property?.agency?.email?.primaryEmail;
    const hasAgencyPhone = !!property?.agency?.phone?.primaryPhone;

    return (
      <>
        <StyledSectionTitle>{t`Publisher Information`}</StyledSectionTitle>
        <StyledOptionsGroup>
          <StyledOptionCard
            isSelected={config.showPublisherBranding}
            onClick={() =>
              hasAgencyName || currentWorkspace?.logo
                ? setConfig((prev) => ({
                    ...prev,
                    showPublisherBranding: !prev.showPublisherBranding,
                  }))
                : null
            }
            style={{
              opacity: hasAgencyName || currentWorkspace?.logo ? 1 : 0.5,
              cursor:
                hasAgencyName || currentWorkspace?.logo
                  ? 'pointer'
                  : 'not-allowed',
            }}
          >
            <StyledOptionIcon
              isSelected={
                config.showPublisherBranding &&
                (property?.agency?.name || currentWorkspace?.logo)
              }
            >
              <IconBuildingSkyscraper size={18} />
            </StyledOptionIcon>
            <StyledOptionContent>
              <StyledOptionLabel
                isSelected={
                  config.showPublisherBranding &&
                  (property?.agency?.name || currentWorkspace?.logo)
                }
              >{t`Agency Branding`}</StyledOptionLabel>
              <StyledOptionDescription>
                {property?.agency?.name || currentWorkspace?.logo
                  ? config.showPublisherBranding
                    ? t`Including agency logo and name`
                    : t`Excluding agency branding`
                  : t`No agency details available`}
              </StyledOptionDescription>
            </StyledOptionContent>
            {config.showPublisherBranding &&
              (property?.agency?.name || currentWorkspace?.logo) && (
                <IconCheck size={16} color="blue" />
              )}
          </StyledOptionCard>

          <StyledOptionCard
            isSelected={config.showPublisherEmail}
            onClick={() =>
              property?.agency?.email?.primaryEmail
                ? setConfig((prev) => ({
                    ...prev,
                    showPublisherEmail: !prev.showPublisherEmail,
                  }))
                : null
            }
            style={{
              opacity: hasAgencyEmail ? 1 : 0.5,
              cursor: hasAgencyEmail ? 'pointer' : 'not-allowed',
            }}
          >
            <StyledOptionIcon
              isSelected={config.showPublisherEmail && hasAgencyEmail}
            >
              <IconMail size={18} />
            </StyledOptionIcon>
            <StyledOptionContent>
              <StyledOptionLabel
                isSelected={config.showPublisherEmail && hasAgencyEmail}
              >{t`Contact Email`}</StyledOptionLabel>
              <StyledOptionDescription>
                {property?.agency?.email?.primaryEmail
                  ? config.showPublisherEmail
                    ? t`Including agency email address`
                    : t`Excluding email contact details`
                  : t`No email contact available`}
              </StyledOptionDescription>
            </StyledOptionContent>
            {config.showPublisherEmail && hasAgencyEmail && (
              <IconCheck size={16} color="blue" />
            )}
          </StyledOptionCard>

          <StyledOptionCard
            isSelected={config.showPublisherPhone}
            onClick={() =>
              hasAgencyPhone
                ? setConfig((prev) => ({
                    ...prev,
                    showPublisherPhone: !prev.showPublisherPhone,
                  }))
                : null
            }
            style={{
              opacity: hasAgencyPhone ? 1 : 0.5,
              cursor: hasAgencyPhone ? 'pointer' : 'not-allowed',
            }}
          >
            <StyledOptionIcon
              isSelected={config.showPublisherPhone && hasAgencyPhone}
            >
              <IconPhone size={18} />
            </StyledOptionIcon>
            <StyledOptionContent>
              <StyledOptionLabel
                isSelected={config.showPublisherPhone && hasAgencyPhone}
              >{t`Contact Phone`}</StyledOptionLabel>
              <StyledOptionDescription>
                {hasAgencyPhone
                  ? config.showPublisherPhone
                    ? t`Including agency phone number`
                    : t`Excluding phone contact details`
                  : t`No phone contact available`}
              </StyledOptionDescription>
            </StyledOptionContent>
            {config.showPublisherPhone && hasAgencyPhone && (
              <IconCheck size={16} color="blue" />
            )}
          </StyledOptionCard>
        </StyledOptionsGroup>
      </>
    );
  };

  return (
    <Modal
      ref={ref}
      size="extraLarge"
      isClosable
      onClose={onClose}
      closedOnMount
      hotkeyScope={ModalHotkeyScope.Default}
      padding="none"
    >
      <StyledModalContainer adaptiveHeight>
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconSettings size={16} />
            <StyledModalTitle>
              {pdfType === 'PropertyDocumentation'
                ? t`Exposé Configuration`
                : t`Flyer Configuration`}
            </StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
            <Button
              variant="primary"
              title={t`Generate`}
              Icon={IconFile}
              onClick={handleGeneratePdf}
              disabled={effectiveIsGenerating}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledModalLayout>
            <StyledOptionsPanel>
              <StyledOptionsGroup>
                <CollapsibleSection title={t`Content Options`}>
                  <StyledOptionCardContainer>
                    <StyledOptionCard
                      isSelected={config.showAllImages}
                      onClick={() =>
                        hasMultipleImages
                          ? setConfig((prev) => ({
                              ...prev,
                              showAllImages: !prev.showAllImages,
                            }))
                          : null
                      }
                      style={{
                        opacity: hasMultipleImages ? 1 : 0.5,
                        cursor: hasMultipleImages ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <StyledOptionIcon
                        isSelected={config.showAllImages && hasMultipleImages}
                      >
                        <IconPhoto size={18} />
                      </StyledOptionIcon>
                      <StyledOptionContent>
                        <StyledOptionLabel
                          isSelected={config.showAllImages && hasMultipleImages}
                        >
                          {t`Multiple Property Images`}
                        </StyledOptionLabel>
                        <StyledOptionDescription>
                          {!hasMultipleImages
                            ? t`Not enough images available`
                            : config.showAllImages
                              ? t`Showing all property images`
                              : t`Showing only the main image`}
                        </StyledOptionDescription>
                      </StyledOptionContent>
                      {config.showAllImages && hasMultipleImages && (
                        <IconCheck size={16} color="blue" />
                      )}
                    </StyledOptionCard>

                    <StyledOptionCard
                      isSelected={config.includeFeatures}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          includeFeatures: !prev.includeFeatures,
                        }))
                      }
                    >
                      <StyledOptionIcon isSelected={config.includeFeatures}>
                        <IconListCheck size={18} />
                      </StyledOptionIcon>
                      <StyledOptionContent>
                        <StyledOptionLabel
                          isSelected={config.includeFeatures}
                        >{t`Property Features`}</StyledOptionLabel>
                        <StyledOptionDescription>
                          {config.includeFeatures
                            ? t`Including property features`
                            : t`Excluding property features`}
                        </StyledOptionDescription>
                      </StyledOptionContent>
                      {config.includeFeatures && (
                        <IconCheck size={16} color="blue" />
                      )}
                    </StyledOptionCard>
                  </StyledOptionCardContainer>
                </CollapsibleSection>

                <StyledSectionDivider />

                {renderPublisherInformationSection()}

                <StyledSectionDivider />

                <CollapsibleSection title={t`Fields to Display`}>
                  <StyledFieldsGrid>
                    {relevantFields.map((field) => {
                      const isSelected = config.selectedFields.includes(field);
                      const index = config.selectedFields.indexOf(field);
                      return (
                        <StyledFieldCard
                          key={field}
                          isSelected={isSelected}
                          onClick={() => toggleField(field)}
                        >
                          <StyledFieldLabelContainer>
                            <StyledFieldLabel isSelected={isSelected}>
                              {
                                objectMetadataItem?.fields.find(
                                  (f) => f.name === field,
                                )?.label
                              }
                            </StyledFieldLabel>
                          </StyledFieldLabelContainer>
                          {isSelected && (
                            <StyledSelectionOrder>
                              {index + 1}
                            </StyledSelectionOrder>
                          )}
                        </StyledFieldCard>
                      );
                    })}
                  </StyledFieldsGrid>
                </CollapsibleSection>
              </StyledOptionsGroup>
            </StyledOptionsPanel>

            <StyledPreviewPanel>
              <StyledSectionTitle>{t`Preview`}</StyledSectionTitle>
              <StyledPreviewContainer>
                <PropertyPdfPreview
                  property={property}
                  isFlyer={pdfType === 'PropertyFlyer'}
                  configuration={config}
                />
              </StyledPreviewContainer>
            </StyledPreviewPanel>
          </StyledModalLayout>
        </StyledModalContent>
      </StyledModalContainer>
    </Modal>
  );
});

PdfConfigurationModal.displayName = 'PdfConfigurationModal';

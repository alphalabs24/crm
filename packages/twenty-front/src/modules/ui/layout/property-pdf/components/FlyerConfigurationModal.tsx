import { useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { forwardRef, useState, useCallback, useMemo, useEffect } from 'react';
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
  IconBolt,
  IconFile,
  IconRefresh,
  IconSettings,
  useIsMobile,
} from 'twenty-ui';
import { useSubcategoryByCategory } from '@/object-record/record-show/hooks/useSubcategoryByCategory';
import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { PropertyPdfPreview, fieldsToShowOnPdf } from './PropertyPdfPreview';
import { ConfigurationType, PdfFlyerConfiguration } from '../types/types';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePropertyImages } from '../../show-page/hooks/usePropertyImages';

// Import our new shared components and utilities
import {
  StyledModalLayout,
  StyledSectionDivider,
  StyledSectionTitle,
  StyledFieldsGrid,
  StyledFieldCard,
  StyledFieldLabelContainer,
  StyledFieldLabel,
  StyledSelectionOrder,
  StyledOptionsGroup,
  StyledOptionsPanel,
  StyledPreviewContainer,
  StyledPreviewPanel,
  CollapsibleSection,
} from './shared/PdfConfigurationComponents';

import {
  useAvailabilityChecks,
  PublisherInformationSection,
  FlyerContentOptions,
} from './shared/PdfConfigurationUtils';
import { usePropertyPdfGenerator } from '../hooks/usePropertyPdfGenerator';

// Extended modal container with minimum height
const StyledModalContainer = styled(BaseModalContainer)`
  min-height: 80vh;
`;

export type PdfConfigurationModalProps = {
  property: ObjectRecord;
  onClose: () => void;
  onGenerate: (
    result: {
      blob: Blob;
      fileName: string;
      previewUrl: string;
    } | null,
  ) => Promise<void>;
  isGenerating?: boolean;
};

export const FlyerConfigurationModal = forwardRef<
  ModalRefType,
  PdfConfigurationModalProps
>(({ property, onClose, onGenerate, isGenerating = false }, ref) => {
  const { t } = useLingui();

  const { generatePdf, isLoading: pdfLoading } = usePropertyPdfGenerator({
    record: property,
    type: 'PropertyFlyer',
  });

  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const isMobile = useIsMobile();
  // TODO Refactor this to never use workspace logo but use the agency logo once available
  const [currentWorkspace] = useRecoilState(currentWorkspaceState);

  const images = usePropertyImages({
    id: property.id,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  // Use our utility to check for data availability
  const availability = useAvailabilityChecks(
    property,
    currentWorkspace?.logo,
    images?.length || 0,
  );

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
  const [config, setConfig] = useState<ConfigurationType>({
    showAllImages: true,
    includeFeatures: true,
    selectedFields: [...relevantFields],
    orientation: 'portrait',
    // Publisher options - default all to true
    showPublisherBranding: true,
    // TODO: Set those to default to true once we want to show them
    showPublisherEmail: false,
    showPublisherPhone: false,
  });

  // Update selected fields when relevantFields change
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      selectedFields: [...relevantFields],
    }));
  }, [relevantFields]);

  // Disable publisher options when related data is not available
  useEffect(() => {
    const { hasAgencyName, hasAgencyEmail, hasAgencyPhone, hasWorkspaceLogo } =
      availability;

    const updates: Partial<PdfFlyerConfiguration> = {};

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
    availability,
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

      const result = await generatePdf(configCopy);
      await onGenerate(result);
      // Close the modal after successful generation
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLocalIsGenerating(false);
    }
  }, [config, generatePdf, onGenerate, onClose]);

  // Render fields selection section
  const renderFieldsSection = () => {
    return (
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
                      objectMetadataItem?.fields.find((f) => f.name === field)
                        ?.label
                    }
                  </StyledFieldLabel>
                </StyledFieldLabelContainer>
                {isSelected && (
                  <StyledSelectionOrder>{index + 1}</StyledSelectionOrder>
                )}
              </StyledFieldCard>
            );
          })}
        </StyledFieldsGrid>
      </CollapsibleSection>
    );
  };

  return (
    <Modal
      ref={ref}
      size="extraLarge"
      isClosable
      onClose={onClose}
      closedOnMount
      portal
      hotkeyScope={ModalHotkeyScope.Default}
      padding="none"
    >
      <StyledModalContainer adaptiveHeight>
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconSettings size={16} />
            <StyledModalTitle>{t`Flyer Configuration`}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
            <Button
              accent="blue"
              variant="primary"
              title={t`Generate`}
              Icon={IconBolt}
              loading={effectiveIsGenerating}
              onClick={handleGeneratePdf}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledModalLayout>
            <StyledOptionsPanel>
              <StyledOptionsGroup>
                <FlyerContentOptions
                  config={config}
                  setConfig={setConfig}
                  availability={availability}
                />

                <StyledSectionDivider />

                <PublisherInformationSection
                  property={property}
                  config={config}
                  setConfig={setConfig}
                  availability={availability}
                />

                <StyledSectionDivider />

                {renderFieldsSection()}
              </StyledOptionsGroup>
            </StyledOptionsPanel>

            {isMobile ? null : (
              <StyledPreviewPanel>
                <StyledSectionTitle>{t`Preview`}</StyledSectionTitle>
                <StyledPreviewContainer>
                  <PropertyPdfPreview
                    property={property}
                    isFlyer
                    configuration={config}
                  />
                </StyledPreviewContainer>
              </StyledPreviewPanel>
            )}
          </StyledModalLayout>
        </StyledModalContent>
      </StyledModalContainer>
    </Modal>
  );
});

FlyerConfigurationModal.displayName = 'FlyerConfigurationModal';

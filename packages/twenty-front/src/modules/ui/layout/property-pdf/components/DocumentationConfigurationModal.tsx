import { useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { forwardRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

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
  IconFile,
  IconMap,
  IconBook2,
  IconPhoto,
  IconListCheck,
  IconFileDescription,
  IconLayoutGrid,
  IconCheck,
} from 'twenty-ui';
import { useSubcategoryByCategory } from '@/object-record/record-show/hooks/useSubcategoryByCategory';
import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mapboxAccessTokenState } from '@/client-config/states/mapboxAccessTokenState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';

import {
  PropertyPdfPreview,
  fieldsToShowOnDocumentation,
} from './PropertyPdfPreview';
import {
  ConfigurationType,
  PdfDocumentationConfiguration,
} from '../types/types';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePropertyImages } from '../../show-page/hooks/usePropertyImages';

// Import our shared components and utilities
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
  StyledOptionCard,
  StyledOptionIcon,
  StyledOptionContent,
  StyledOptionLabel,
  StyledOptionDescription,
  StyledOptionCardContainer,
} from './shared/PdfConfigurationComponents';

import {
  useAvailabilityChecks,
  PublisherInformationSection,
} from './shared/PdfConfigurationUtils';

// Extended modal container with minimum height
const StyledModalContainer = styled(BaseModalContainer)`
  min-height: 80vh;
`;

export type DocumentationConfigurationModalProps = {
  property: ObjectRecord;
  onClose: () => void;
  onGenerate: (config: ConfigurationType) => Promise<void>;
  isGenerating?: boolean;
};

// Documentation Content Options Component
export const DocumentationContentOptions = ({
  config,
  setConfig,
  availability,
  property,
  mapboxAccessToken,
  colorSchemeToUse,
}: {
  config: ConfigurationType;
  setConfig: (
    updater: (prevConfig: ConfigurationType) => ConfigurationType,
  ) => void;
  availability: ReturnType<typeof useAvailabilityChecks>;
  property: ObjectRecord;
  mapboxAccessToken?: string;
  colorSchemeToUse: 'light' | 'dark';
}) => {
  const { t } = useLingui();

  // Generate map URL if coordinates are available and Mapbox token exists
  const mapUrl = useMemo(() => {
    const address = property.address;
    if (
      !address ||
      !address.addressLat ||
      !address.addressLng ||
      !mapboxAccessToken
    ) {
      return '';
    }

    // Choose map style based on color scheme
    const mapStyle = colorSchemeToUse === 'dark' ? 'dark-v11' : 'streets-v11';

    return `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/pin-s+ff0000(${address.addressLng},${address.addressLat})/${address.addressLng},${address.addressLat},16/600x400@2x?access_token=${mapboxAccessToken}`;
  }, [property.address, mapboxAccessToken, colorSchemeToUse]);

  // Calculate available data
  const hasMapData = !!mapUrl;
  const hasDescription = !!property.description;
  const hasFloorplan =
    !!property.floorplanUrl ||
    (property.attachments && property.attachments.length > 0);

  // Update config if map data becomes unavailable
  useEffect(() => {
    if (config.showAddressMap && !hasMapData) {
      setConfig((prev) => ({
        ...prev,
        showAddressMap: false,
      }));
    } else if (config.showAddressMap && hasMapData) {
      setConfig((prev) => ({
        ...prev,
        showAddressMap: true,
        addressMapUrl: mapUrl,
      }));
    }
  }, [hasMapData, config.showAddressMap, setConfig, mapUrl]);

  return (
    <CollapsibleSection title={t`Content Options`}>
      <StyledOptionCardContainer>
        {/* Images Option */}
        <StyledOptionCard
          isSelected={config.showAllImages}
          onClick={() =>
            availability.hasMultipleImages
              ? setConfig((prev) => ({
                  ...prev,
                  showAllImages: !prev.showAllImages,
                }))
              : null
          }
          style={{
            opacity: availability.hasMultipleImages ? 1 : 0.5,
            cursor: availability.hasMultipleImages ? 'pointer' : 'not-allowed',
          }}
        >
          <StyledOptionIcon
            isSelected={config.showAllImages && availability.hasMultipleImages}
          >
            <IconPhoto size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel
              isSelected={
                config.showAllImages && availability.hasMultipleImages
              }
            >
              {t`Image Gallery`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {!availability.hasMultipleImages
                ? t`Not enough images available`
                : config.showAllImages
                  ? t`Showing all property images`
                  : t`Showing only the main image`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showAllImages && availability.hasMultipleImages && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard>

        {/* Description Option */}
        <StyledOptionCard
          isSelected={config.showDescription}
          onClick={() =>
            hasDescription
              ? setConfig((prev) => ({
                  ...prev,
                  showDescription: !prev.showDescription,
                }))
              : null
          }
          style={{
            opacity: hasDescription ? 1 : 0.5,
            cursor: hasDescription ? 'pointer' : 'not-allowed',
          }}
        >
          <StyledOptionIcon
            isSelected={config.showDescription && hasDescription}
          >
            <IconFileDescription size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel
              isSelected={config.showDescription && hasDescription}
            >
              {t`Description`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {!hasDescription
                ? t`No description available`
                : config.showDescription
                  ? t`Including property description`
                  : t`Excluding property description`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showDescription && hasDescription && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard>

        {/* Features Option */}
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
            <StyledOptionLabel isSelected={config.includeFeatures}>
              {t`Features`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {config.includeFeatures
                ? t`Including property features`
                : t`Excluding property features`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.includeFeatures && <IconCheck size={16} color="blue" />}
        </StyledOptionCard>

        {/* Map Option */}
        <StyledOptionCard
          isSelected={config.showAddressMap}
          onClick={() =>
            hasMapData
              ? setConfig((prev) => ({
                  ...prev,
                  showAddressMap: !prev.showAddressMap,
                }))
              : null
          }
          style={{
            opacity: hasMapData ? 1 : 0.5,
            cursor: hasMapData ? 'pointer' : 'not-allowed',
          }}
        >
          <StyledOptionIcon isSelected={config.showAddressMap && hasMapData}>
            <IconMap size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel isSelected={config.showAddressMap && hasMapData}>
              {t`Address`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {!hasMapData
                ? t`No location data available`
                : config.showAddressMap
                  ? t`Including property location`
                  : t`Excluding property location`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showAddressMap && hasMapData && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard>

        {/* Floorplan Option */}
        {/* <StyledOptionCard
          isSelected={config.showFloorplan}
          onClick={() =>
            hasFloorplan
              ? setConfig((prev) => ({
                  ...prev,
                  showFloorplan: !prev.showFloorplan,
                }))
              : null
          }
          style={{
            opacity: hasFloorplan ? 1 : 0.5,
            cursor: hasFloorplan ? 'pointer' : 'not-allowed',
          }}
        >
          <StyledOptionIcon isSelected={config.showFloorplan && hasFloorplan}>
            <IconLayoutGrid size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel
              isSelected={config.showFloorplan && hasFloorplan}
            >
              {t`Floorplan`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {!hasFloorplan
                ? t`No floorplan available`
                : config.showFloorplan
                  ? t`Including property floorplan`
                  : t`Excluding property floorplan`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showFloorplan && hasFloorplan && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard> */}

        {/* Additional Documents Option */}
        {/* <StyledOptionCard
          isSelected={config.showAdditionalDocuments}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              showAdditionalDocuments: !prev.showAdditionalDocuments,
            }))
          }
        >
          <StyledOptionIcon isSelected={config.showAdditionalDocuments}>
            <IconFile size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel isSelected={config.showAdditionalDocuments}>
              {t`Additional Documents`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {config.showAdditionalDocuments
                ? t`Including property attachments`
                : t`Excluding property attachments`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showAdditionalDocuments && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard> */}
      </StyledOptionCardContainer>
    </CollapsibleSection>
  );
};

export const DocumentationConfigurationModal = forwardRef<
  ModalRefType,
  DocumentationConfigurationModalProps
>(({ property, onClose, onGenerate, isGenerating = false }, ref) => {
  const { t } = useLingui();
  const [localIsGenerating, setLocalIsGenerating] = useState(false);

  // TODO Refactor this to never use workspace logo but use the agency logo once available
  const [currentWorkspace] = useRecoilState(currentWorkspaceState);
  const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);

  // Color scheme handling for map display
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

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
    const baseFields = fieldsToShowOnDocumentation.filter(
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
    // Publisher options - default all to true
    showPublisherBranding: true,
    showPublisherEmail: true,
    showPublisherPhone: true,
    // Documentation specific options
    showAddressMap: true,
    showDescription: true,
    showFloorplan: true,
    showAdditionalDocuments: true,
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

    const updates: Partial<PdfDocumentationConfiguration> = {};

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
            <IconBook2 size={16} />
            <StyledModalTitle>{t`Exposé Configuration`}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
            <Button
              variant="primary"
              title={t`Generate`}
              Icon={IconFile}
              accent="blue"
              onClick={handleGeneratePdf}
              disabled={effectiveIsGenerating}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>

        <StyledModalContent>
          <StyledModalLayout>
            <StyledOptionsPanel>
              <StyledOptionsGroup>
                <DocumentationContentOptions
                  config={config}
                  setConfig={setConfig}
                  availability={availability}
                  property={property}
                  mapboxAccessToken={mapboxAccessToken ?? undefined}
                  colorSchemeToUse={
                    colorSchemeToUse === 'Dark' ? 'dark' : 'light'
                  }
                />

                <StyledSectionDivider />

                <CollapsibleSection title={t`Publisher Information`}>
                  <PublisherInformationSection
                    property={property}
                    config={config}
                    setConfig={setConfig}
                    availability={availability}
                    hideTitle={true}
                  />
                </CollapsibleSection>

                {/* Keep the state and props for fields but don't render the UI */}
                {/* renderFieldsSection() */}
              </StyledOptionsGroup>
            </StyledOptionsPanel>

            <StyledPreviewPanel>
              <StyledSectionTitle>{t`Preview`}</StyledSectionTitle>
              <StyledPreviewContainer>
                <PropertyPdfPreview
                  property={property}
                  isFlyer={false}
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

DocumentationConfigurationModal.displayName = 'DocumentationConfigurationModal';

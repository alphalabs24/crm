/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { DefaultPropertyPdfTemplate } from '@/ui/layout/property-pdf/components/templates/default/DefaultPropertyPdfTemplate';
import { PdfTheme } from '@/ui/layout/property-pdf/constants/defaultTheme';
import {
  ConfigurationType,
  PdfFlyerConfiguration,
  PropertyPdfResult,
  PropertyPdfTemplate,
  PropertyPdfType,
} from '@/ui/layout/property-pdf/types/types';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import * as ReactPDF from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { useSubcategoryByCategory } from '@/object-record/record-show/hooks/useSubcategoryByCategory';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Attachment } from '@/activities/files/types/Attachment';
import { useLocalizedStaticTexts } from './useLocalizedStaticTexts';

// Fields to show on PDF
const fieldsToShowOnPdf = [
  'category',
  ...Object.values(CATEGORY_SUBTYPES),
  'rooms',
  'offerType',
  'availableFrom',
  'constructionYear',
  'features',
];

// Default PDF configuration
const defaultPdfConfiguration: ConfigurationType = {
  showAllImages: true,
  includeFeatures: true,
  selectedFields: fieldsToShowOnPdf,
  orientation: 'portrait',
  // Publisher options defaults
  showPublisherBranding: true,
  showPublisherEmail: true,
  showPublisherPhone: true,
  showAddressMap: false,
  showAdditionalDocuments: false,
  showDescription: false,
  showFloorplan: false,
  addressMapUrl: '',
  floorplanUrl: '',
};

export type PropertyPdfGeneratorProps = {
  record: ObjectRecord;
  template?: PropertyPdfTemplate;
  theme?: PdfTheme;
  type?: PropertyPdfType;
};

export const usePropertyPdfGenerator = ({
  record,
  template = DefaultPropertyPdfTemplate,
  type = 'PropertyDocumentation',
}: PropertyPdfGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<PropertyPdfResult | null>(null);
  const PropertyDocumentTemplate = template;
  const pdfPreviewModalRef = useRef<ModalRefType>(null);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const { formatField } = useFormattedPropertyFields({
    objectMetadataItem,
  });

  const { attachments } = useAttachments({
    id: record?.agency?.id,
    targetObjectNameSingular: CoreObjectNameSingular.Agency,
  });

  const agencyLogo = useMemo(() => {
    return attachments?.find((a) => a.type === 'PublisherLogo');
  }, [attachments]);

  // Get the subcategory field based on the property's category
  const subcategoryField = useSubcategoryByCategory(record?.category);

  const targetableObject = useMemo(() => {
    return {
      id: record.id,
      targetObjectNameSingular: CoreObjectNameSingular.Property,
    };
  }, [record?.id]);

  // Hook for loading property images
  const propertyImages = usePropertyImages(targetableObject);
  const isImagesLoading = false; // We don't have a loading state from the hook currently

  // Function to open the preview page
  const openPreview = useCallback(() => {
    if (record?.id) {
      pdfPreviewModalRef.current?.open();
    }
  }, [record?.id]);

  const localizedStaticTexts = useLocalizedStaticTexts({
    type,
  });

  const generatePdf = useCallback(
    async (
      orientationOrConfig?: 'portrait' | 'landscape' | ConfigurationType,
    ) => {
      if (!record) return null;

      // Handle both old and new parameter formats for backward compatibility
      let config: ConfigurationType;
      if (typeof orientationOrConfig === 'string') {
        // Old format: just orientation was passed
        config = {
          ...defaultPdfConfiguration,
          orientation: orientationOrConfig,
        };
      } else if (orientationOrConfig) {
        // New format: full configuration object
        config = orientationOrConfig;
      } else {
        // No config provided, use defaults
        config = {
          ...defaultPdfConfiguration,
          showAddressMap: false,
          showAdditionalDocuments: false,
          showDescription: false,
          showFloorplan: false,
        };
      }

      setIsLoading(true);

      try {
        // Format the address for display
        const address = record.address;
        const formattedAddress = address
          ? `${address.addressStreet1 || ''}, ${address.addressPostcode || ''} ${
              address.addressCity || ''
            }, ${address.addressCountry || ''}`
          : 'No address available';

        // Format price for display - following same logic as PropertyPdfPreview.tsx
        let price = 'Price on request';

        // Simple string price
        if (typeof record.price === 'string') {
          price = record.price;
        }
        // For sale properties
        else if (record.sellingPrice?.amountMicros) {
          const amount = record.sellingPrice.amountMicros / 1000000;
          const currencyCode = record.sellingPrice.currencyCode || 'CHF';
          price = `${currencyCode} ${amount.toLocaleString()}`;
        }
        // For rent properties
        else if (record.rentNet?.amountMicros) {
          const amount = record.rentNet.amountMicros / 1000000;
          const currencyCode = record.rentNet.currencyCode || 'CHF';
          price = `${currencyCode} ${amount.toLocaleString()} / month`;
        }

        // Sort images by order and limit them based on configuration
        // Exactly matching PropertyPdfPreview.tsx behavior
        let sortedImages = [...propertyImages].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );

        // If configuration says not to show all images, just show the first one (cover image)
        if (!config.showAllImages && sortedImages.length > 0) {
          sortedImages = [sortedImages[0]];
        }

        // Format fields based on selected fields in configuration
        // Using the selected fields from config, just like in PropertyPdfPreview.tsx
        const formattedFields = config.selectedFields.map((field: string) => ({
          label: objectMetadataItem.fields.find((f) => f.name === field)?.label,
          value: formatField(field, record[field]) ?? undefined,
          key: field,
        }));

        // Format features if they should be included based on configuration
        // Following the same conditional logic as PropertyPdfPreview.tsx
        let formattedFeatures = [];
        if (config.includeFeatures && record.features) {
          const fieldMetadata = objectMetadataItem.fields.find(
            (f) => f.name === 'features',
          );
          formattedFeatures = record.features.map((feature: string) => {
            const featureMetadata = fieldMetadata?.options?.find(
              (o) => o.value === feature,
            );
            return {
              label: featureMetadata?.label,
              value: feature,
              key: feature,
            };
          });
        }

        // Create the PDF document using react-pdf
        const blob = await ReactPDF.pdf(
          <PropertyDocumentTemplate
            type={type}
            property={record}
            propertyPrice={price}
            propertyAddress={formattedAddress}
            propertyImages={sortedImages}
            fields={formattedFields}
            propertyFeatures={formattedFeatures}
            orientation={config.orientation || 'portrait'}
            agencyLogo={agencyLogo?.fullPath}
            configuration={config}
            localizedStaticTexts={localizedStaticTexts}
          />,
        ).toBlob();

        // Generate a file name for the PDF
        const fileName = `${record.name?.replace(/\s+/g, '_') || 'property'}_${
          type === 'PropertyDocumentation' ? 'documentation' : 'flyer'
        }.pdf`;

        // Create a URL for previewing the PDF
        const previewUrl = URL.createObjectURL(blob);

        const result = {
          blob,
          fileName,
          previewUrl,
        };

        setPdfFile(result);
        setIsLoading(false);
        return result;
      } catch (error) {
        console.error('Error generating PDF:', error);
        setIsLoading(false);
        return null;
      }
    },
    [
      record,
      propertyImages,
      PropertyDocumentTemplate,
      type,
      agencyLogo?.fullPath,
      localizedStaticTexts,
      objectMetadataItem.fields,
      formatField,
    ],
  );

  const downloadPdf = useCallback(
    async (
      orientationOrConfig?: 'portrait' | 'landscape' | ConfigurationType,
    ) => {
      const result = await generatePdf(orientationOrConfig);
      if (result) {
        saveAs(result.blob, result.fileName);
        return result;
      }
      return null;
    },
    [generatePdf],
  );

  return {
    isLoading: isLoading || isImagesLoading,
    generatePdf,
    downloadPdf,
    pdfFile,
    openPreview,
    pdfPreviewModalRef,
    subcategoryField,
  };
};

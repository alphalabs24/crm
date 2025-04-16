/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { DefaultPropertyPdfTemplate } from '@/ui/layout/property-pdf/components/templates/default/DefaultPropertyPdfTemplate';
import { PdfTheme } from '@/ui/layout/property-pdf/constants/defaultTheme';
import {
  PropertyPdfResult,
  PropertyPdfTemplate,
  PropertyPdfType,
} from '@/ui/layout/property-pdf/types/types';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import * as ReactPDF from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useCallback, useMemo, useRef, useState } from 'react';
import { formatCurrency } from '~/utils/format';

export type PropertyPdfGeneratorProps = {
  record: ObjectRecord | null;
  template?: PropertyPdfTemplate;
  theme?: PdfTheme;
};

export const usePropertyPdfGenerator = ({
  record,
  template = DefaultPropertyPdfTemplate,
}: PropertyPdfGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<PropertyPdfResult | null>(null);
  const PropertyDocumentTemplate = template;
  const pdfPreviewModalRef = useRef<ModalRefType>(null);

  // Create targetable object for images
  const targetableObject: ActivityTargetableObject = useMemo(
    () => ({
      id: record?.id || '',
      targetObjectNameSingular: CoreObjectNameSingular.Property,
    }),
    [record?.id],
  );

  // Hook for loading property images
  const propertyImages = usePropertyImages(targetableObject);
  const isImagesLoading = false; // We don't have a loading state from the hook currently

  // Function to open the preview page
  const openPreview = useCallback(() => {
    if (record?.id) {
      pdfPreviewModalRef.current?.open();
    }
  }, [record?.id]);

  const generatePdf = useCallback(
    async (
      type: PropertyPdfType,
      orientation: 'portrait' | 'landscape' = 'portrait',
      fields: {
        label?: string;
        value?: string;
      }[],
    ) => {
      if (!record) return null;

      setIsLoading(true);

      try {
        // Format the address for display
        const address = record.address;
        const formattedAddress = address
          ? `${address.addressStreet1 || ''}, ${address.addressPostcode || ''} ${
              address.addressCity || ''
            }, ${address.addressCountry || ''}`
          : 'No address available';

        // Format the price for display
        const currencyConfig = {
          currency: 'CHF',
          locale: 'de-CH',
        };

        // Handle price formatting with proper currency code
        let price = 'Price on request';
        if (record.sellingPrice?.amount) {
          price = formatCurrency(
            record.sellingPrice.amount,
            record.sellingPrice.currencyCode || currencyConfig.currency,
          );
        } else if (record.rentNet?.amount) {
          price = `${formatCurrency(
            record.rentNet.amount,
            record.rentNet.currencyCode || currencyConfig.currency,
          )} / month`;
        }

        // Sort images by order
        const sortedImages = [...propertyImages].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );

        // Create the PDF document using react-pdf
        const blob = await ReactPDF.pdf(
          <PropertyDocumentTemplate
            type={type}
            property={record}
            propertyPrice={price}
            propertyAddress={formattedAddress}
            orientation={orientation}
            propertyImages={sortedImages}
            fields={fields}
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
    [record, propertyImages, PropertyDocumentTemplate],
  );

  const downloadPdf = useCallback(
    async (
      type: PropertyPdfType,
      orientation: 'portrait' | 'landscape' = 'portrait',
      fields: {
        label?: string;
        value?: string;
      }[],
    ) => {
      const result = await generatePdf(type, orientation, fields);
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
  };
};

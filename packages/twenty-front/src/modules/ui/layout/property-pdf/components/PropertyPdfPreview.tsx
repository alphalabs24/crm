/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import styled from '@emotion/styled';
import { PDFViewer } from '@react-pdf/renderer';
import { useMemo } from 'react';
import { DefaultPropertyPdfTemplate } from './templates/default/DefaultPropertyPdfTemplate';
import { useRecoilState } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

const StyledPdfViewerContainer = styled.div`
  align-items: center;
  background: #f5f5f5;
  bottom: 0;
  display: flex;
  justify-content: center;
  height: 100%;
`;

const StyledPDFViewer = styled(PDFViewer)`
  border: none;
  height: 100%;
  width: 100%;
`;

export const fieldsToShowOnPdf = [
  'category',
  ...Object.values(CATEGORY_SUBTYPES),
  'rooms',
  'offerType',
  'availableFrom',
  'constructionYear',
  'features',
];

type PropertyPdfPreviewProps = {
  property: ObjectRecord;
  isFlyer?: boolean;
};

export const PropertyPdfPreview = ({
  property,
  isFlyer = false,
}: PropertyPdfPreviewProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const { formatField } = useFormattedPropertyFields({
    objectMetadataItem,
  });

  // Show these fields in the PDF
  const formattedFields = useMemo(() => {
    return fieldsToShowOnPdf.map((field) => ({
      label: objectMetadataItem.fields.find((f) => f.name === field)?.label,
      value: formatField(field, property[field]) ?? undefined,
      key: field,
    }));
  }, [objectMetadataItem.fields, formatField, property]);

  const [currentWorkspace] = useRecoilState(currentWorkspaceState);

  // Format the address for display
  const formattedAddress = useMemo(() => {
    const address = property.address;
    return address
      ? `${address.addressStreet1 || ''}, ${address.addressPostcode || ''} ${
          address.addressCity || ''
        }, ${address.addressCountry || ''}`
      : 'No address available';
  }, [property.address]);

  // Format price for display
  const price = useMemo(() => {
    // Simple string price
    if (typeof property.price === 'string') return property.price;

    // For sale properties
    if (property.sellingPrice?.amountMicros) {
      const amount = property.sellingPrice.amountMicros / 1000000;
      const currencyCode = property.sellingPrice.currencyCode || 'CHF';
      // Format with thousand separators
      return `${currencyCode} ${amount.toLocaleString()}`;
    }

    // For rent properties
    if (property.rentNet?.amountMicros) {
      const amount = property.rentNet.amountMicros / 1000000;
      const currencyCode = property.rentNet.currencyCode || 'CHF';
      return `${currencyCode} ${amount.toLocaleString()} / month`;
    }

    return 'Price on request';
  }, [property.price, property.sellingPrice, property.rentNet]);

  // Ensure images are in the correct format
  const images = usePropertyImages({
    id: property.id,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  const formattedFeatures = useMemo(() => {
    const fieldMetadata = objectMetadataItem.fields.find(
      (f) => f.name === 'features',
    );
    const formattedFeatures = [];
    for (const feature of property.features) {
      const featureMetadata = fieldMetadata?.options?.find(
        (o) => o.value === feature,
      );
      formattedFeatures.push({
        label: featureMetadata?.label,
        value: feature,
        key: feature,
      });
    }
    return formattedFeatures;
  }, [objectMetadataItem.fields, property.features]);

  const sortedImages = [...images].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <StyledPdfViewerContainer>
      <StyledPDFViewer>
        <DefaultPropertyPdfTemplate
          property={property}
          type={isFlyer ? 'PropertyFlyer' : 'PropertyDocumentation'}
          propertyAddress={formattedAddress}
          propertyPrice={price}
          propertyImages={sortedImages}
          fields={formattedFields}
          propertyFeatures={formattedFeatures}
          orientation={'portrait'}
          agencyLogo={currentWorkspace?.logo}
        />
      </StyledPDFViewer>
    </StyledPdfViewerContainer>
  );
};

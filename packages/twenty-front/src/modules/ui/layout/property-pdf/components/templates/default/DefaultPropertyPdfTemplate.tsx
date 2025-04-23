/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { DefaultFlyerTemplate } from '@/ui/layout/property-pdf/components/templates/default/DefaultFlyerTemplate';
import {
  PropertyPdfProps,
  PropertyPdfType,
} from '@/ui/layout/property-pdf/types/types';
import { Document } from '@react-pdf/renderer';

export type DefaultPropertyPdfTemplateProps = PropertyPdfProps & {
  type: PropertyPdfType;
};

// Main Document Component
export const DefaultPropertyPdfTemplate = ({
  property,
  propertyPrice,
  propertyAddress,
  type,
  orientation = 'portrait',
  propertyImages,
  fields,
  propertyFeatures,
  agencyLogo,
}: DefaultPropertyPdfTemplateProps) => (
  <Document>
    {type === 'PropertyFlyer' ? (
      <DefaultFlyerTemplate
        property={property}
        propertyPrice={propertyPrice}
        propertyAddress={propertyAddress}
        propertyImages={propertyImages}
        orientation={orientation}
        fields={fields}
        propertyFeatures={propertyFeatures}
        agencyLogo={agencyLogo}
      />
    ) : null}
  </Document>
);

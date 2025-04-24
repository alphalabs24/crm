/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { Document } from '@react-pdf/renderer';
import { PropertyPdfProps, PropertyPdfType } from '../../../types/types';
import { DefaultFlyerTemplate } from './DefaultFlyerTemplate';
import { DefaultDocumentationTemplate } from './DefaultDocumentationTemplate';

export type DefaultPropertyPdfTemplateProps = PropertyPdfProps & {
  type: PropertyPdfType;
};

export const DefaultPropertyPdfTemplate = ({
  type,
  property,
  propertyPrice,
  propertyAddress,
  orientation,
  propertyImages,
  fields,
  propertyFeatures,
  agencyLogo,
  showPublisherBranding = true,
  showPublisherEmail = true,
  showPublisherPhone = true,
}: DefaultPropertyPdfTemplateProps) => {
  return (
    <Document>
      {type === 'PropertyFlyer' ? (
        <DefaultFlyerTemplate
          property={property}
          propertyPrice={propertyPrice}
          propertyAddress={propertyAddress}
          orientation={orientation}
          propertyImages={propertyImages}
          fields={fields}
          propertyFeatures={propertyFeatures}
          agencyLogo={agencyLogo}
          showPublisherBranding={showPublisherBranding}
          showPublisherEmail={showPublisherEmail}
          showPublisherPhone={showPublisherPhone}
        />
      ) : (
        <DefaultDocumentationTemplate
          property={property}
          propertyPrice={propertyPrice}
          propertyAddress={propertyAddress}
          orientation={orientation}
          propertyImages={propertyImages}
          fields={fields}
          propertyFeatures={propertyFeatures}
          agencyLogo={agencyLogo}
          showPublisherBranding={showPublisherBranding}
          showPublisherEmail={showPublisherEmail}
          showPublisherPhone={showPublisherPhone}
        />
      )}
    </Document>
  );
};

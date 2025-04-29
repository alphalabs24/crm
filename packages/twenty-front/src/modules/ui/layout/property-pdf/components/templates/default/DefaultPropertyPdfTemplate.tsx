/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { Document } from '@react-pdf/renderer';
import {
  DefaultDocumentationTemplateProps,
  PropertyPdfProps,
  PropertyPdfType,
} from '../../../types/types';
import { DefaultFlyerTemplate } from './DefaultFlyerTemplate';
import { DefaultDocumentationTemplate } from './DefaultDocumentationTemplate';

export type DefaultPropertyPdfTemplateProps =
  DefaultDocumentationTemplateProps & {
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
  configuration,
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
          configuration={configuration}
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
          configuration={configuration}
        />
      )}
    </Document>
  );
};

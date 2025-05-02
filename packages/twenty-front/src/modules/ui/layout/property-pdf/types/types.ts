import { Attachment } from '@/activities/files/types/Attachment';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Maybe } from 'graphql/jsutils/Maybe';

export type PropertyImageType = {
  id: string;
  fullPath: string;
  order: number;
};

export type PropertyPdfType = 'PropertyDocumentation' | 'PropertyFlyer';

export type PropertyPdfResult = {
  blob: Blob;
  fileName: string;
  previewUrl: string;
};

type PropertyFieldType = {
  label?: string;
  value?: string;
  key?: string;
};

export type LocalizedStaticPdfTextsType = {
  descriptionTitle?: string;
  fieldsTitle?: string;
  tableOfContentsTitle?: string;
  locationTitle?: string;
  featuresTitle?: string;
  priceTitle?: string;
  spaceTitle?: string;
  furtherDetailsTitle?: string;
  propertyDetailsTitle?: string;
  galleryTitle?: string;
  floorplanTitle?: string;
  additionalDocumentsTitle?: string;
};

// Props for the main document component
export type PropertyPdfProps = {
  property: ObjectRecord;
  propertyPrice: string;
  propertyAddress: string;
  orientation: 'portrait' | 'landscape';
  propertyImages: Attachment[];
  fields: PropertyFieldType[];
  propertyFeatures?: PropertyFieldType[];
  agencyLogo?: Maybe<string>;
  // Publisher options
  showPublisherBranding?: boolean;
  showPublisherEmail?: boolean;
  showPublisherPhone?: boolean;
  configuration?: ConfigurationType;
  localizedStaticTexts?: LocalizedStaticPdfTextsType;
};

export type DefaultDocumentationTemplateProps = PropertyPdfProps & {
  addressMapUrl?: string;
  floorplanUrl?: string;
  showAddressMap?: boolean;
  showAdditionalDocuments?: boolean;
  showDescription?: boolean;
  Footer?: React.ReactNode;
  Header?: React.ReactNode;
};

export type PdfBaseConfiguration = {
  selectedFields: string[];
  // Publisher options
  showPublisherBranding: boolean;
  showPublisherEmail: boolean;
  showPublisherPhone: boolean;
};

// Specific configuration for the flyer PDF
export type PdfFlyerConfiguration = {
  showAllImages: boolean;
  includeFeatures: boolean;
  selectedFields: string[];
  orientation?: 'portrait' | 'landscape';
} & PdfBaseConfiguration;

// Specific configuration for the documentation PDF
export type PdfDocumentationConfiguration = PdfBaseConfiguration & {
  showAddressMap?: boolean;
  showAdditionalDocuments?: boolean;
  // Additional options for documentation
  showAllImages?: boolean;
  showDescription?: boolean;
  showFloorplan?: boolean;
  addressMapUrl?: string;
  floorplanUrl?: string;
};

export type ConfigurationType = PdfFlyerConfiguration &
  PdfDocumentationConfiguration;

export type PropertyPdfTemplate = React.FC<
  DefaultDocumentationTemplateProps & {
    type: PropertyPdfType;
  }
>;

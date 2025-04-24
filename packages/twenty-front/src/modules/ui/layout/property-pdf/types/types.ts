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
};

export type DefaultDocumentationTemplateProps = PropertyPdfProps & {
  addressMapUrl?: string;
  floorplanUrl?: string;
  showAddressMap?: boolean;
  showAdditionalDocuments?: boolean;
  Footer?: React.ReactNode;
};

export type PdfBaseConfiguration = {
  selectedFields: string[];
  // Publisher options
  showPublisherBranding: boolean;
  showPublisherEmail: boolean;
  showPublisherPhone: boolean;
};

// Specific configuration for the flyer PDF
export type PdfFlyerConfiguration = PdfBaseConfiguration & {
  showAllImages: boolean;
  includeFeatures: boolean;
  orientation: 'portrait' | 'landscape';
};

// Specific configuration for the documentation PDF
export type PdfDocumentationConfiguration = PdfBaseConfiguration & {
  showAddressMap: boolean;
  showAdditionalDocuments: boolean;
};

export type PropertyPdfTemplate = React.FC<
  PropertyPdfProps & {
    type: PropertyPdfType;
  }
>;

import { Attachment } from '@/activities/files/types/Attachment';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

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

// Props for the main document component
export type PropertyPdfProps = {
  property: ObjectRecord;
  propertyPrice: string;
  propertyAddress: string;
  orientation: 'portrait' | 'landscape';
  propertyImages: Attachment[];
  fields: {
    label?: string;
    value?: string;
  }[];
};

export type PropertyPdfTemplate = React.FC<
  PropertyPdfProps & {
    type: PropertyPdfType;
  }
>;

// Props for various sections of the PDF document
export type PropertyHeroProps = {
  property: ObjectRecord;
  formattedAddress: string;
  price: string;
  coverImage?: string;
  isFlyer?: boolean;
};

export type FeatureTagsProps = {
  features: string[];
  isFlyer?: boolean;
};

export type PropertyOverviewProps = {
  property: ObjectRecord;
  isFlyer?: boolean;
};

export type PropertyDescriptionProps = {
  description?: string;
};

export type PropertyGalleryProps = {
  images: Attachment[];
  isFlyer?: boolean;
  startIndex?: number;
};

export type AgencyInfoProps = {
  property: ObjectRecord;
  isFlyer?: boolean;
};

export type FlyerContactInfoProps = {
  property: ObjectRecord;
  isFlyer?: boolean;
};

export type FlyerGalleryProps = {
  images: Attachment[];
};

export type DocumentFooterProps = {
  property: ObjectRecord;
  isFlyer?: boolean;
};

export type PropertyDetailsProps = {
  property: ObjectRecord;
};

export type BuildingInfoProps = {
  property: ObjectRecord;
};

export type VirtualTourProps = {
  virtualTour?: {
    primaryLinkUrl?: string;
  };
};

export type PropertyDocFirstPageProps = {
  property: ObjectRecord;
  formattedAddress: string;
  price: string;
  propertyImages?: Attachment[];
  orientation: 'portrait' | 'landscape';
};

export type Attachment = {
  id: string;
  name: string;
  fullPath: string;
  type: AttachmentType;
  companyId: string;
  personId: string;
  authorId: string;
  createdAt: string;
  description: string;
  orderIndex: number;
  __typename: string;
};

export type PropertyAttachmentType =
  | 'PropertyImage'
  | 'PropertyDocument'
  | 'PropertyVideo'
  | 'PropertyDocumentation'
  | 'PropertyFlyer'
  | 'EmailTemplateImage'
  | 'PublisherLogo';

export type AttachmentType =
  | 'Archive'
  | 'Audio'
  | 'Image'
  | 'Presentation'
  | 'Spreadsheet'
  | 'TextDocument'
  | 'Video'
  | 'Other'
  | PropertyAttachmentType;

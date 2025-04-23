const publicAttachmentTypes = [
  'PropertyDocumentation',
  'PropertyFlyer',
  'EmailTemplateImage',
];

export const isPublicAttachmentType = (type: string): boolean => {
  return publicAttachmentTypes.includes(type);
};

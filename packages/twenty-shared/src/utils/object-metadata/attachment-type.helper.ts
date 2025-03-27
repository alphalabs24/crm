const publicAttachmentTypes = ['PropertyDocumentation', 'PropertyFlyer'];

export const isPublicAttachmentType = (type: string): boolean => {
  return publicAttachmentTypes.includes(type);
};

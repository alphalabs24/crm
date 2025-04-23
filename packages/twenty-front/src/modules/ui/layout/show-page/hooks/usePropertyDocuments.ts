import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useMemo } from 'react';

// Document types to filter for
export const DOCUMENT_TYPES = [
  'PropertyDocument',
  'PropertyDocumentation',
  'PropertyFlyer',
];

export const usePropertyDocuments = (
  targetableObject: ActivityTargetableObject,
) => {
  const { attachments = [] } = useAttachments(targetableObject);

  const documents = useMemo(
    () =>
      attachments
        .filter((attachment) => DOCUMENT_TYPES.includes(attachment.type))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [attachments],
  );

  // Group documents by type for easier access
  const documentsByType = useMemo(() => {
    const result: Record<string, any[]> = {};

    for (const docType of DOCUMENT_TYPES) {
      result[docType] = documents.filter((doc) => doc.type === docType);
    }

    return result;
  }, [documents]);

  return {
    allDocuments: documents,
    documentsByType,
  };
};

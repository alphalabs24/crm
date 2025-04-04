import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useMemo } from 'react';

export const usePropertyImages = (
  targetableObject: ActivityTargetableObject,
) => {
  const { attachments = [] } = useAttachments(targetableObject);

  const images = useMemo(
    () =>
      attachments
        .filter((attachment) => attachment.type === 'PropertyImage')
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [attachments],
  );

  return images;
};

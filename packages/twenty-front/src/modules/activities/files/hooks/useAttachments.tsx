import { Attachment } from '@/activities/files/types/Attachment';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMemo } from 'react';

export const useAttachments = (targetableObject: ActivityTargetableObject) => {
  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const { records: allAttachments, loading } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    },
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
  });

  // TODO: This is a fix to make sure we only return attachments that truly belong to this record
  // There seems to be an issue with how GraphQL/Apollo caches attachments, leading to
  // attachments from other objects being returned. This client-side filter ensures
  // we only get the attachments that actually belong to the target object.
  const attachments = useMemo(() => {
    if (!allAttachments?.length) return allAttachments;

    return allAttachments.filter((attachment) => {
      // Cast to any because TypeScript doesn't know about the dynamic fields
      return (
        (attachment as any)[targetableObjectFieldIdName] === targetableObject.id
      );
    });
  }, [allAttachments, targetableObject.id, targetableObjectFieldIdName]);

  return {
    attachments,
    loading,
  };
};

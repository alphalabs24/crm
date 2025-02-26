import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import deepEqual from 'deep-equal';
import { useMemo } from 'react';

type Stage = 'draft' | 'published' | 'archived' | 'scheduled' | 'overwritten';

export const usePublicationsOfProperty = (
  propertyId?: string,
  stage?: Stage,
) => {
  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: CoreObjectNameSingular.Property,
  });

  const { records: publications } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Publication,
    filter: {
      ...(propertyId
        ? { [targetableObjectFieldIdName]: { eq: propertyId } }
        : {}),
      ...(stage ? { stage: { eq: stage.toUpperCase() } } : {}),
    },
  });

  const arePublicationsEqual = (pub1: any, pub2: any) => {
    return deepEqual(pub1, pub2, { strict: true });
  };

  return {
    publications,
    arePublicationsEqual,
  };
};

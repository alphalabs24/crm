import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import deepEqual from 'deep-equal';
import { useMemo } from 'react';
import { PublicationStage } from '~/modules/object-record/record-show/constants/PublicationStage';
import { PlatformId } from '~/modules/ui/layout/show-page/components/nm/types/Platform';

type Stage = 'draft' | 'published' | 'archived' | 'scheduled' | 'overwritten';

export const usePublicationsOfProperty = (
  propertyId?: string,
  stage?: Stage,
) => {
  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: CoreObjectNameSingular.Property,
  });

  const {
    records: publications,
    refetch,
    loading,
  } = useFindManyRecords({
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

  const publicationGroups = useMemo(() => {
    return publications.reduce(
      (groups: Record<PlatformId, Record<string, any[]>>, publication: any) => {
        const platform = publication.platform as PlatformId;
        const publicationStage = publication.stage as PublicationStage;
        if (!groups[platform]) {
          groups[platform] = {
            all: [],
          };
        }

        if (!groups[platform][publicationStage]) {
          groups[platform][publicationStage] = [];
        }

        groups[platform][publicationStage].push(publication);
        groups[platform].all.push(publication);

        return groups;
      },
      {} as Record<PlatformId, Record<string, any[]>>,
    );
  }, [publications]);

  return {
    publications,
    publicationGroups,
    arePublicationsEqual,
    refetch,
    loading,
  };
};

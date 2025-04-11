import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import deepEqual from 'deep-equal';
import { useMemo } from 'react';
import { PublicationStage } from '~/modules/object-record/record-show/constants/PublicationStage';
import { PlatformId } from '~/modules/ui/layout/show-page/components/nm/types/Platform';

type Stage = 'draft' | 'published' | 'archived' | 'scheduled' | 'overwritten';

// Define a type for publication groups
export type PublicationGroupsType = Record<
  string | 'all',
  Record<string, any[]>
>;

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
    // Create all stage buckets for a platform
    const createStagesBucket = () => {
      const bucket: Record<string, any[]> = { all: [] };

      // Add bucket for each PublicationStage value
      Object.values(PublicationStage).forEach((stageValue) => {
        bucket[stageValue] = [];
      });

      return bucket;
    };

    // Initialize result with an 'all' platform group
    const result: PublicationGroupsType = {
      all: createStagesBucket(),
    };

    return publications.reduce(
      (groups: PublicationGroupsType, publication: any) => {
        const platform = publication.platform as PlatformId;
        const publicationStage = publication.stage as PublicationStage;

        // Add to platform-specific group if it doesn't exist yet
        if (!groups[platform]) {
          groups[platform] = createStagesBucket();
        }

        // Add to platform-specific stage group (non-null assertion is safe because we just created it if missing)
        groups[platform][publicationStage]?.push(publication);
        // Add to platform-specific all group
        groups[platform].all.push(publication);

        // Add to all platform stage group
        groups.all[publicationStage]?.push(publication);
        // Add to all platform all group
        groups.all.all.push(publication);

        return groups;
      },
      result,
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

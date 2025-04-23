import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import deepEqual from 'deep-equal';
import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const {
    records: publications,
    refetch,
    loading,
  } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Publication,
    recordGqlFields: recordGqlFields,
    filter: {
      ...(propertyId
        ? { [targetableObjectFieldIdName]: { eq: propertyId } }
        : {}),
      ...(stage ? { stage: { eq: stage.toUpperCase() } } : {}),
    },
    onCompleted: useRecoilCallback(
      ({ set }) =>
        (fetchedPublications: ObjectRecord[]) => {
          for (const publication of fetchedPublications) {
            set(recordStoreFamilyState(publication.id), publication);
          }
        },
      [],
    ),
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

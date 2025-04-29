import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isProperty } from '@/object-metadata/utils/isPropertyOrPublication';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useAttachRelatedRecordFromRecord } from '@/object-record/hooks/useAttachRelatedRecordFromRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FeatureFlagKey } from '~/generated/graphql';

// If Multi-Agency is disabled, we need to set the agency relation to the property or publication
export const AutoSetAgencyEffect = () => {
  const { objectNameSingular, objectRecordId } = useParams();
  const [loading, setLoading] = useState(false);

  const isMultiPublisherEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsMultiPublisherEnabled,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Agency,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const { records: agencyRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Agency,
    recordGqlFields,
    skip: !objectMetadataItem,
  });

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectNameSingular ?? '',
  });

  const firstAgencyRecord = useMemo(() => agencyRecords?.[0], [agencyRecords]);

  // Email Template Relations
  const { updateOneRecordAndAttachRelations: attachAgencyToProperty } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular: CoreObjectNameSingular.Agency,
      fieldNameOnRecordObject: 'properties',
    });

  const { updateOneRecordAndAttachRelations: attachAgencyToPublication } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular: CoreObjectNameSingular.Agency,
      fieldNameOnRecordObject: 'publications',
    });

  const setAgencyRelation = useCallback(async () => {
    if (
      loading ||
      !firstAgencyRecord ||
      !objectRecordId ||
      isMultiPublisherEnabled ||
      !objectNameSingular ||
      firstAgencyRecord?.[objectNamePlural]
        ?.map((record: ObjectRecord) => record.id)
        ?.includes(objectRecordId)
    )
      return;

    try {
      setLoading(true);

      if (isProperty(objectNameSingular)) {
        await attachAgencyToProperty({
          recordId: firstAgencyRecord.id,
          relatedRecordId: objectRecordId,
        });
      } else {
        await attachAgencyToPublication({
          recordId: firstAgencyRecord.id,
          relatedRecordId: objectRecordId,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    attachAgencyToProperty,
    attachAgencyToPublication,
    firstAgencyRecord,
    isMultiPublisherEnabled,
    loading,
    objectNamePlural,
    objectNameSingular,
    objectRecordId,
  ]);

  useEffect(() => {
    setAgencyRelation();
  }, [setAgencyRelation]);

  return null;
};

import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { propertyPlatformMetricsState } from '@/object-record/record-show/states/propertyPlatformMetricsState';
import { AppPath } from '@/types/AppPath';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const PropertyPlatformMetricsEffect = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const { objectNameSingular, objectRecordId } = useParams();
  const { useQueries } = useNestermind();
  const setPropertyPlatformMetrics = useSetRecoilState(
    propertyPlatformMetricsState(objectRecordId ?? ''),
  );

  const isPropertyPage = isMatchingLocation(AppPath.RecordShowPropertyPage);
  const isProperty = objectNameSingular === CoreObjectNameSingular.Property;

  // Only fetch when viewing a property and have an ID
  const shouldFetch = isPropertyPage && isProperty && !!objectRecordId;

  const { data } = useQueries.usePropertyMetricsByPlatform(
    shouldFetch && objectRecordId ? [objectRecordId] : null,
    {
      enabled: shouldFetch,
    },
  );

  // Update Recoil state whenever the data changes
  useEffect(() => {
    if (data?.data && objectRecordId && data.data[objectRecordId]) {
      setPropertyPlatformMetrics(data.data[objectRecordId]);
    }
  }, [data, objectRecordId, setPropertyPlatformMetrics]);

  return null;
};

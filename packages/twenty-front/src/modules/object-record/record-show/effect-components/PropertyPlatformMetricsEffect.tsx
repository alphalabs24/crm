import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { propertyPlatformMetricsState } from '@/object-record/record-show/states/propertyPlatformMetricsState';
import { AppPath } from '@/types/AppPath';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const PropertyPlatformMetricsEffect = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const { objectNameSingular, objectRecordId } = useParams();
  const { metricsApi } = useNestermind();
  const [fetchedMetrics, setFetchedMetrics] = useState<Set<string>>(new Set());
  const setPropertyPlatformMetrics = useSetRecoilState(
    propertyPlatformMetricsState(objectRecordId ?? ''),
  );

  useEffect(() => {
    const isPropertyPage = isMatchingLocation(AppPath.RecordShowPropertyPage);
    const isProperty = objectNameSingular === CoreObjectNameSingular.Property;

    if (
      isPropertyPage &&
      isProperty &&
      objectRecordId &&
      !fetchedMetrics.has(objectRecordId)
    ) {
      const fetchMetrics = async () => {
        try {
          const response = await metricsApi.calculatePropertyMetricsByPlatform([
            objectRecordId,
          ]);
          setPropertyPlatformMetrics(response.data[objectRecordId]);
          setFetchedMetrics((prev) => new Set(prev).add(objectRecordId));
        } catch (error) {
          console.error('Failed to fetch property platform metrics:', error);
        }
      };

      fetchMetrics();
    }
  }, [
    isMatchingLocation,
    objectNameSingular,
    objectRecordId,
    metricsApi,
    setPropertyPlatformMetrics,
    fetchedMetrics,
  ]);

  return null;
};

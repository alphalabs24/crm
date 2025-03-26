import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { publicationMetricsState } from '@/object-record/record-show/states/publicationMetricsState';
import { AppPath } from '@/types/AppPath';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const PublicationMetricsEffect = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const { objectNameSingular, objectRecordId } = useParams();
  const { metricsApi } = useNestermind();
  const [fetchedMetrics, setFetchedMetrics] = useState<Set<string>>(new Set());
  const setPublicationMetrics = useSetRecoilState(
    publicationMetricsState(objectRecordId ?? ''),
  );

  useEffect(() => {
    const isPropertyPage = isMatchingLocation(AppPath.RecordShowPropertyPage);
    const isPublication =
      objectNameSingular === CoreObjectNameSingular.Publication;

    if (
      isPropertyPage &&
      isPublication &&
      objectRecordId &&
      !fetchedMetrics.has(objectRecordId)
    ) {
      const fetchMetrics = async () => {
        try {
          const response = await metricsApi.calculatePublicationMetrics([
            objectRecordId,
          ]);
          setPublicationMetrics(response.data[objectRecordId]);
          setFetchedMetrics((prev) => new Set(prev).add(objectRecordId));
        } catch (error) {
          console.error('Failed to fetch publication metrics:', error);
        }
      };

      fetchMetrics();
    }
  }, [
    isMatchingLocation,
    objectNameSingular,
    objectRecordId,
    metricsApi,
    setPublicationMetrics,
    fetchedMetrics,
  ]);

  return null;
};

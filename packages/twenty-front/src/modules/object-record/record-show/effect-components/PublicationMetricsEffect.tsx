import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { publicationMetricsState } from '@/object-record/record-show/states/publicationMetricsState';
import { AppPath } from '@/types/AppPath';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const PublicationMetricsEffect = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const { objectNameSingular, objectRecordId } = useParams();
  const {
    useQueries: { usePublicationMetrics },
  } = useNestermind();
  const setPublicationMetrics = useSetRecoilState(
    publicationMetricsState(objectRecordId ?? ''),
  );

  const isPropertyPage = isMatchingLocation(AppPath.RecordShowPropertyPage);
  const isPublication =
    objectNameSingular === CoreObjectNameSingular.Publication;

  // Only fetch when viewing a publication and have an ID
  const shouldFetch = isPropertyPage && isPublication && !!objectRecordId;

  // fetch the publication metrics
  const { data, error } = usePublicationMetrics(
    shouldFetch && objectRecordId ? [objectRecordId] : null,
    {
      enabled: shouldFetch,
    },
  );

  // Update Recoil state when data changes
  useEffect(() => {
    if (data?.data && objectRecordId && data.data[objectRecordId]) {
      setPublicationMetrics(data.data[objectRecordId]);
    }
  }, [data, objectRecordId, setPublicationMetrics]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch publication metrics:', error);
    }
  }, [error]);

  return null;
};

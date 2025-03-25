import { useNestermind } from '@/api/hooks/useNestermind';
import { publicationMetricsState } from '@/object-record/record-show/states/publicationMetricsState';
import { useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type PublicationMetricsEffectProps = {
  publicationId: string;
};

export const PublicationMetricsEffect = ({
  publicationId,
}: PublicationMetricsEffectProps) => {
  const setPublicationMetrics = useSetRecoilState(
    publicationMetricsState(publicationId),
  );
  const { metricsApi } = useNestermind();

  const getPublicationMetrics = useCallback(async () => {
    if (!publicationId || publicationId === 'default') return;

    try {
      const response = await metricsApi.calculatePublicationMetrics([
        publicationId,
      ]);
      setPublicationMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch publication metrics:', error);
    }
  }, [metricsApi, publicationId, setPublicationMetrics]);

  useEffect(() => {
    getPublicationMetrics();
  }, [getPublicationMetrics]);

  return null;
};

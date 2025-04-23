import { atomFamily } from 'recoil';

export type PublicationMetrics =
  | {
      contacts: number;
      contactsByStage: Record<string, number>;
    }
  | undefined;

export const publicationMetricsState = atomFamily<PublicationMetrics, string>({
  key: 'publicationMetricsState',
  default: () => undefined,
});

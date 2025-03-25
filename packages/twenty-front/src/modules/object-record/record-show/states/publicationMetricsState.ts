import { atomFamily } from 'recoil';

export type PublicationMetrics = {
  contacts: number;
  contactsByStage: Record<string, number>;
};

export const publicationMetricsState = atomFamily<PublicationMetrics, string>({
  key: 'publicationMetricsState',
  default: () => ({
    contacts: 0,
    contactsByStage: {},
  }),
});

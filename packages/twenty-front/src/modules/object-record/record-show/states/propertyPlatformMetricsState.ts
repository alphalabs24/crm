import { atomFamily } from 'recoil';

export type PropertyPlatformMetrics = {
  contacts: number;
  contactsByPlatform: Record<string, number>;
};

export const propertyPlatformMetricsState = atomFamily<
  PropertyPlatformMetrics | undefined,
  string
>({
  key: 'propertyPlatformMetricsState',
  default: () => undefined,
});

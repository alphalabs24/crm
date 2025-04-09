import { useProviderGuard } from '@/onboarding/hooks/useProviderGuard';
import React from 'react';
import { PropertyPlatformMetricsEffect } from '../effect-components/PropertyPlatformMetricsEffect';
import { PublicationMetricsEffect } from '../effect-components/PublicationMetricsEffect';

// Fetch REST data from the nestermind API here!
export const NestermindDataProvider = ({
  children,
}: React.PropsWithChildren) => {
  const blockProvider = useProviderGuard();

  if (blockProvider) return children;

  return (
    <>
      <PublicationMetricsEffect />
      <PropertyPlatformMetricsEffect />
      {children}
    </>
  );
};

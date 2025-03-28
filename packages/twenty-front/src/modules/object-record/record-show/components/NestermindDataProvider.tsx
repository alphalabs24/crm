import React from 'react';
import { PropertyPlatformMetricsEffect } from '../effect-components/PropertyPlatformMetricsEffect';
import { PublicationMetricsEffect } from '../effect-components/PublicationMetricsEffect';

// Fetch REST data from the nestermind API here!
export const NestermindDataProvider = ({
  children,
}: React.PropsWithChildren) => {
  return (
    <>
      <PublicationMetricsEffect />
      <PropertyPlatformMetricsEffect />
      {children}
    </>
  );
};

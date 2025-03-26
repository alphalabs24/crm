import React from 'react';
import { PublicationMetricsEffect } from '../effect-components/PublicationMetricsEffect';

// Fetch REST data from the nestermind API here!
export const NestermindDataProvider = ({
  children,
}: React.PropsWithChildren) => {
  return (
    <>
      <PublicationMetricsEffect />
      {children}
    </>
  );
};

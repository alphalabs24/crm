import { useMemo } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

/**
 * Custom hook that provides additional filters based on the object type
 * Used to exclude certain types of records from specific object types
 */
export const useObjectTypeSpecificFilters = ({
  objectNameSingular,
}: {
  objectNameSingular?: string;
}) => {
  const typeSpecificFilters = useMemo(() => {
    if (!objectNameSingular) {
      return {};
    }

    // For Notes, exclude EmailTemplate types
    if (objectNameSingular === CoreObjectNameSingular.Note) {
      return {
        type: { neq: 'EmailTemplate' },
      };
    }

    // Add other object-specific filters here as needed

    return {};
  }, [objectNameSingular]);

  return {
    typeSpecificFilters,
  };
};

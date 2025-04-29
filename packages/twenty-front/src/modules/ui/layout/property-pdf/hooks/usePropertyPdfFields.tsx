import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMemo } from 'react';

const fieldsToShow = ['category', 'rooms', 'livingSurface', ''];

export const usePropertyPdfFields = (
  propertyMetadataItem?: ObjectMetadataItem,
  property?: ObjectRecord,
) => {
  const keyFields = useMemo(() => {
    if (!propertyMetadataItem || !property) return [];
    return fieldsToShow.map((field) => ({
      label: propertyMetadataItem.fields.find((f) => f.name === field)?.label,
      value: property?.[field],
    }));
  }, [propertyMetadataItem, property]);

  return {
    keyFields,
  };
};

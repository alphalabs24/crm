import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const SEARCHABLE_STANDARD_OBJECTS_IN_COMBINED_REQUEST_NAMES_PLURAL = [
  'companies',
  'people',
  'opportunities',
  'buyerLeads',
  'publications',
  'agencies',
  'properties',
];
export const isObjectMetadataItemSearchableInCombinedRequest = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  return (
    objectMetadataItem.isCustom ||
    SEARCHABLE_STANDARD_OBJECTS_IN_COMBINED_REQUEST_NAMES_PLURAL.includes(
      objectMetadataItem.namePlural,
    )
  );
};

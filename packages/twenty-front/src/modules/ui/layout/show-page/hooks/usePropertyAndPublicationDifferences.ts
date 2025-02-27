import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMemo } from 'react';
import deepEqual from 'deep-equal';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

// These keys are ignored when comparing. Add new publication-specific keys here!
const doNotCompareKeys = [
  'id',
  'createdAt',
  'updatedAt',
  'platform',
  '__typename',
  'propertyId',
  'publishUntil',
  'stage',
];

export type PropertyPublicationDifference = {
  key: string;
  propertyValue: any;
  publicationValue: any;
  fieldLabel: string; // Human readable field name
  propertyFieldMetadataItem: FieldMetadataItem | undefined;
  publicationFieldMetadataItem: FieldMetadataItem | undefined;
  propertyMetadataItem: ObjectMetadataItem;
  publicationMetadataItem: ObjectMetadataItem;
  // TODO: show platforms in difference UI. Maybe handle each platform individually (show difference for each draft)
  platforms?: string[];
};

export const usePropertyAndPublicationDifferences = (
  propertyRecord: ObjectRecord | null,
  publications: ObjectRecord[] | undefined,
) => {
  const { objectMetadataItem: publicationMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular: CoreObjectNameSingular.Publication,
    },
  );

  const { objectMetadataItem: propertyMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const propertyFieldMetadataLabels = useMemo(() => {
    const map: Record<string, string> = {};
    propertyMetadataItem?.fields.forEach((field) => {
      map[field.name] = field.label;
    });
    return map;
  }, [propertyMetadataItem]);

  const differences = useMemo(() => {
    if (!publications || publications.length === 0 || !propertyRecord)
      return [];

    const diffs: PropertyPublicationDifference[] = [];

    for (const publication of publications) {
      if (!publication) continue;

      Object.keys(publication).forEach((key) => {
        if (
          !deepEqual(propertyRecord?.[key], publication[key], {
            strict: true,
          }) &&
          !doNotCompareKeys.includes(key) &&
          propertyFieldMetadataLabels[key] // Only include fields we have labels for
        ) {
          diffs.push({
            key,
            propertyValue: propertyRecord?.[key],
            publicationValue: publication[key],
            fieldLabel: propertyFieldMetadataLabels[key],
            propertyFieldMetadataItem: propertyMetadataItem?.fields.find(
              (field) => field.name === key,
            ),
            publicationFieldMetadataItem: publicationMetadataItem?.fields.find(
              (field) => field.name === key,
            ),
            propertyMetadataItem: propertyMetadataItem,
            publicationMetadataItem: publicationMetadataItem,
          });
        }
      });
    }

    return diffs;
  }, [
    publications,
    propertyRecord,
    propertyFieldMetadataLabels,
    propertyMetadataItem,
    publicationMetadataItem,
  ]);

  return {
    differences,
  };
};

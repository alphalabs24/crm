import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMemo } from 'react';
import deepEqual from 'deep-equal';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// These keys are ignored when comparing
const doNotCompareKeys = [
  'id',
  'createdAt',
  'updatedAt',
  'platform',
  '__typename',
  'propertyId',
  'publishUntil',
  'stage',
  'position',
  'searchVector',
  'taskTargets',
  'favorites',
  'noteTargets',
  'timelineActivites',
  // TODO: handle relations
  'assigneeId',
  'agencyId',
  'sellerId',
];

export type PropertyPublicationDifference = {
  key: string;
  propertyValue: any;
  publicationValue: any;
  fieldLabel: string;
  propertyFieldMetadataItem: FieldMetadataItem | undefined;
  publicationFieldMetadataItem: FieldMetadataItem | undefined;
};

export type PublicationDifferences = {
  publicationId: string;
  platform: string;
  differences: PropertyPublicationDifference[];
};

export const usePropertyAndPublicationDifferences = (
  propertyRecord: ObjectRecord | null,
  publications: ObjectRecord[] | undefined,
) => {
  const { objectMetadataItem: propertyMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const propertyFieldMetadataLabels = useMemo(() => {
    const map: Record<string, string> = {};
    propertyMetadataItem?.fields.forEach((field) => {
      if (field.name) map[field.name] = field.label;
    });
    return map;
  }, [propertyMetadataItem]);

  const differenceRecords = useMemo(() => {
    if (!publications || publications.length === 0 || !propertyRecord) {
      return [];
    }

    const allDifferences: PublicationDifferences[] = [];

    // Process each publication
    for (const publication of publications) {
      if (!publication) continue;

      const publicationDiffs: PropertyPublicationDifference[] = [];

      // Compare fields
      Object.keys(publication).forEach((key) => {
        if (
          !deepEqual(propertyRecord?.[key], publication[key], {
            strict: true,
          }) &&
          !doNotCompareKeys.includes(key) &&
          propertyFieldMetadataLabels[key]
        ) {
          publicationDiffs.push({
            key,
            propertyValue: propertyRecord?.[key],
            publicationValue: publication[key],
            fieldLabel: propertyFieldMetadataLabels[key],
            propertyFieldMetadataItem: propertyMetadataItem?.fields.find(
              (field) => field?.name === key,
            ),
            publicationFieldMetadataItem: propertyMetadataItem?.fields.find(
              (field) => field?.name === key,
            ),
          });
        }
      });

      // Only add to results if there are differences
      if (publicationDiffs.length > 0) {
        allDifferences.push({
          publicationId: publication.id,
          platform: publication.platform,
          differences: publicationDiffs,
        });
      }
    }

    return allDifferences;
  }, [
    publications,
    propertyRecord,
    propertyFieldMetadataLabels,
    propertyMetadataItem,
  ]);

  return {
    differenceRecords,
  };
};

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMemo } from 'react';
import { isDeeplyEqual } from '../../../../../utils/isDeeplyEqual';

// These keys are ignored when comparing
const IGNORE_FIELD_KEYS = [
  'id',
  'createdAt',
  'createdBy',
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
  // TODO: handle these relations separately
  'assigneeId',
  'agencyId',
  'sellerId',
  // Image-related fields will be handled in a second step
  'images',
  'coverImage',
];

export type FieldDifference = {
  key: string;
  draftValue: any;
  publishedValue: any;
  fieldLabel: string;
  fieldMetadataItem: FieldMetadataItem | undefined;
};

export type PublicationDifference = {
  draftId: string;
  publishedId: string;
  platform: string;
  differences: FieldDifference[];
};

/**
 * Hook to compare differences between draft and published publications
 *
 * @param draftPublications - Array of draft publications to compare
 * @param publishedPublications - Array of published publications to compare
 * @returns Object containing differences between draft and published publications
 */
export const useDraftPublishedDifferences = (
  draftRecord?: ObjectRecord | null,
  publishedRecord?: ObjectRecord | null,
) => {
  // Get metadata for publication object
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });

  // Create a map of field labels for easier access
  const fieldMetadataLabels = useMemo(() => {
    const map: Record<string, string> = {};
    objectMetadataItem?.fields.forEach((field) => {
      if (field.name) map[field.name] = field.label;
    });
    return map;
  }, [objectMetadataItem]);

  // Compute differences between the first draft and first published publication
  const differences = useMemo(() => {
    if (!draftRecord || !publishedRecord || !objectMetadataItem) {
      return [];
    }

    const firstDraft = draftRecord;
    const publishedResult: PublicationDifference[] = [];

    // Find the published publication with the same platform
    const matchingPublished = publishedRecord;

    if (!matchingPublished) {
      return [];
    }

    const fieldDifferences: FieldDifference[] = [];

    // Compare each field in the draft publication
    Object.keys(firstDraft).forEach((key) => {
      // Skip fields that should be ignored
      if (IGNORE_FIELD_KEYS.includes(key)) {
        return;
      }

      // Use deep comparison for objects, regular comparison for primitives
      const fieldIsEqual = isDeeplyEqual(
        firstDraft[key],
        matchingPublished[key],
        { strict: true },
      );

      if (!fieldIsEqual && fieldMetadataLabels[key]) {
        // Add difference to the list
        fieldDifferences.push({
          key,
          draftValue: firstDraft[key],
          publishedValue: matchingPublished[key],
          fieldLabel: fieldMetadataLabels[key],
          fieldMetadataItem: objectMetadataItem.fields.find(
            (field) => field?.name === key,
          ),
        });
      }
    });

    // Only add to results if there are differences
    if (fieldDifferences.length > 0) {
      publishedResult.push({
        draftId: firstDraft.id,
        publishedId: matchingPublished.id,
        platform: firstDraft.platform,
        differences: fieldDifferences,
      });
    }

    return publishedResult;
  }, [draftRecord, publishedRecord, objectMetadataItem, fieldMetadataLabels]);

  return {
    differences,
    hasDifferences: differences.length > 0,
    totalDifferenceCount: differences.reduce(
      (count, diff) => count + diff.differences.length,
      0,
    ),
    firstDraft: draftRecord || null,
    firstPublished: publishedRecord || null,
  };
};

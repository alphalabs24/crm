import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { usePublicationImages } from '@/object-record/record-show/contexts/PublicationImagesProvider';
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

export type AttachmentDifference = {
  type: string; // 'image', 'document', etc.
  draftAttachments: any[];
  publishedAttachments: any[];
};

export type FieldDifference = {
  key: string;
  draftValue: any;
  publishedValue: any;
  fieldLabel: string;
  fieldMetadataItem: FieldMetadataItem | undefined;
  isCustomDiff?: boolean;
};

export type PublicationDifference = {
  draftId: string;
  publishedId: string;
  platform: string;
  differences: FieldDifference[];
  attachmentDifferences: Record<string, AttachmentDifference>;
};

/**
 * Compares two date values by only comparing their day, month and year values
 * Ignores time components to avoid false positives from small time differences
 *
 * @param date1 First date value (string or Date)
 * @param date2 Second date value (string or Date)
 * @returns true if the dates have the same day, month and year
 */
const areDatesEqual = (date1: any, date2: any): boolean => {
  if (!date1 && !date2) return true;
  if (!date1 || !date2) return false;

  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  } catch (e) {
    // If there's an error parsing the dates, fall back to regular comparison
    return date1 === date2;
  }
};

/**
 * Hook to compare differences between draft and published publications
 *
 * @param draftRecord - Array of draft publications to compare
 * @param publishedRecord - Array of published publications to compare
 * @returns Object containing differences between draft and published publications
 */
export const useDraftPublishedDifferences = (
  draftRecord?: ObjectRecord,
  publishedRecord?: ObjectRecord,
) => {
  // Get metadata for publication object
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });

  const { draftImages, publishedImages } = usePublicationImages();

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
    const attachmentDifferences: Record<string, AttachmentDifference> = {};

    // Compare each field in the draft publication
    Object.keys(firstDraft).forEach((key) => {
      // Skip fields that should be ignored
      if (IGNORE_FIELD_KEYS.includes(key)) {
        return;
      }

      // Get the field metadata item
      const fieldMetadata = objectMetadataItem.fields.find(
        (field) => field?.name === key,
      );

      // For date fields or availableFrom fields, use date-only comparison
      const isDateField =
        fieldMetadata?.type === 'DATE' ||
        key.toLowerCase().includes('availablefrom');

      let fieldIsEqual;

      if (isDateField) {
        fieldIsEqual = areDatesEqual(firstDraft[key], matchingPublished[key]);
      } else {
        // Use deep comparison for objects, regular comparison for primitives
        fieldIsEqual = isDeeplyEqual(firstDraft[key], matchingPublished[key], {
          strict: true,
        });
      }

      if (!fieldIsEqual && fieldMetadataLabels[key]) {
        // Add difference to the list
        fieldDifferences.push({
          key,
          draftValue: firstDraft[key],
          publishedValue: matchingPublished[key],
          fieldLabel: fieldMetadataLabels[key],
          fieldMetadataItem: fieldMetadata,
        });
      }
    });

    // Handle image differences (custom comparison for attachments)
    if (draftImages?.length > 0 || publishedImages?.length > 0) {
      const hasImageChanges = !isDeeplyEqual(draftImages, publishedImages, {
        strict: false, // Less strict comparison since these might have system fields that differ
      });

      if (hasImageChanges) {
        // Store attachment differences for special rendering
        attachmentDifferences['PropertyImage'] = {
          type: 'PropertyImage',
          draftAttachments: draftImages || [],
          publishedAttachments: publishedImages || [],
        };

        // Add a custom field difference for images
        fieldDifferences.push({
          key: 'PropertyImage',
          draftValue: draftImages,
          publishedValue: publishedImages,
          fieldLabel: 'PropertyImage',
          fieldMetadataItem: undefined,
          isCustomDiff: true,
        });
      }
    }

    // Only add to results if there are differences
    if (fieldDifferences.length > 0) {
      publishedResult.push({
        draftId: firstDraft.id,
        publishedId: matchingPublished.id,
        platform: firstDraft.platform,
        differences: fieldDifferences,
        attachmentDifferences,
      });
    }

    return publishedResult;
  }, [
    draftRecord,
    publishedRecord,
    objectMetadataItem,
    fieldMetadataLabels,
    draftImages,
    publishedImages,
  ]);

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

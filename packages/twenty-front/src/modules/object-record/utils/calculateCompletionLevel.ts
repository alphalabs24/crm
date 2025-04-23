import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type CompletionLevel = 'low' | 'medium' | 'high';

export type CompletionInfo = {
  level: CompletionLevel;
  percentage: number;
};

/**
 * Calculates the completion level and percentage for a record
 * Used across components to ensure consistent completion metrics
 */
export const calculateCompletionLevel = (
  record?: ObjectRecord | null,
): CompletionInfo => {
  if (!record) return { level: 'low', percentage: 0 };

  // TODO: Change the required fields depending on platform and need. This is a temporary solution.
  // Fields to check for completeness
  const fields = [
    'description',
    'address',
    'surface',
    'rooms',
    'category',
    'priceUnit',
    'floor',
    'constructionYear',
    'renovationYear',
    'features',
    'volume',
    'platform',
    'availableFrom',
    'emailTemplateId',
    'numberOfFloors',
    'rooms',
    'surface',
    'agencyId',
  ];

  // Count how many fields are filled
  // TODO: make this metric more sophisticated (e.g. checking selling type and platform specific needs.)
  const filledFields = fields.filter((field) => {
    let value = record[field];
    if (field === 'address') {
      value = record.address?.addressStreet1;
    }
    const isCompleted = value !== undefined && value !== null;
    return isCompleted;
  }).length;

  const percentage = Math.round((filledFields / fields.length) * 100);

  if (percentage < 50) return { level: 'low', percentage };
  if (percentage < 80) return { level: 'medium', percentage };
  return { level: 'high', percentage };
};

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from 'twenty-shared';
import { formatToHumanReadableDate } from '~/utils/format/formatDate';

type FieldValue = string | number | boolean | Date | null | undefined;
type PropertyFieldMetadata = {
  type: string;
  name: string;
  label?: string;
};

export const useFormattedPropertyFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const formatFieldValue = (
    field: PropertyFieldMetadata,
    value: FieldValue,
  ): string | null => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Skip if value is an object (except Date)
    if (typeof value === 'object' && !(value instanceof Date)) {
      return null;
    }

    // Handle specific field types
    switch (field.type) {
      case 'BOOLEAN':
        return (value as boolean) ? 'Yes' : 'No';

      case 'NUMBER': {
        const numValue = value as number;
        // Handle measurements
        if (field.name.toLowerCase().includes('surface')) {
          return `${numValue.toLocaleString()} m²`;
        }
        if (field.name.toLowerCase().includes('volume')) {
          return `${numValue.toLocaleString()} m³`;
        }
        // Handle years
        if (
          field.name === 'constructionYear' ||
          field.name === 'renovationYear'
        ) {
          return numValue.toString();
        }

        // Default number formatting
        return numValue.toLocaleString();
      }

      case 'DATE':
        if (field.name === 'availableFrom') {
          return formatToHumanReadableDate(value as Date | string);
        }
        return new Date(value as Date | string).toLocaleDateString();

      case 'TEXT':
      case 'RICH_TEXT':
        if (field.name === 'description') {
          const strValue = String(value);
          return strValue.length > 300
            ? strValue.substring(0, 300) + '...'
            : strValue;
        }
        return String(value);

      case 'SELECT':
        // Handle enumerated fields that need capitalization
        if (['category', 'offerType', 'stage'].includes(field.name)) {
          return capitalize(String(value).toLowerCase());
        }
        return String(value);

      default:
        return String(value);
    }
  };

  const formatField = (fieldName: string, value: FieldValue) => {
    const field = objectMetadataItem.fields.find((f) => f.name === fieldName);
    if (!field) {
      return typeof value === 'object' && !(value instanceof Date)
        ? null
        : String(value ?? '-');
    }

    return formatFieldValue(field, value);
  };

  const formatFields = (fields: Record<string, FieldValue>) => {
    return Object.entries(fields).reduce(
      (acc, [fieldName, value]) => {
        const formatted = formatField(fieldName, value);
        // Only include non-null formatted values
        if (formatted !== null) {
          acc[fieldName] = formatted;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  return {
    formatField,
    formatFields,
    formatFieldValue,
  };
};

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLingui } from '@lingui/react/macro';
import { capitalize } from 'twenty-shared';
import { formatAmount } from '~/utils/format/formatAmount';
import { formatToHumanReadableDate } from '~/utils/format/formatDate';

type FieldValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | {
      amountMicros?: number;
      currencyCode?: string;
    };

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
  const { t } = useLingui();

  const formatFieldValue = (
    field: PropertyFieldMetadata,
    value: FieldValue,
  ): string | null => {
    if (value === null || value === undefined) {
      return null;
    }

    // Handle price fields (sellingPrice, rentNet, rentExtra, valuation)
    if (
      ['sellingPrice', 'rentNet', 'rentExtra', 'valuation'].includes(
        field.name,
      ) &&
      typeof value === 'object' &&
      'amountMicros' in value &&
      'currencyCode' in value &&
      value.amountMicros &&
      value.currencyCode
    ) {
      const formattedAmount = formatAmount(value.amountMicros / 1000000);

      const currencyCode = value.currencyCode;
      // Different formats based on field type
      switch (field.name) {
        case 'rentNet':
        case 'rentExtra':
          return t`${formattedAmount} ${currencyCode} / month`;
        default:
          return t`${formattedAmount} ${currencyCode}`;
      }
    }

    // Skip if value is an object (except Date)
    if (typeof value === 'object' && !(value instanceof Date)) {
      return null;
    }

    // Handle specific field types
    switch (field.type) {
      case 'BOOLEAN':
        return (value as boolean) ? t`Yes` : t`No`;

      case 'NUMBER': {
        const numValue = value as number;
        const localString = numValue.toLocaleString();
        // Handle measurements
        if (field.name.toLowerCase().includes('surface')) {
          return t`${localString} m²`;
        }
        if (field.name.toLowerCase().includes('volume')) {
          return t`${localString} m³`;
        }
        // Handle years
        if (
          field.name === 'constructionYear' ||
          field.name === 'renovationYear'
        ) {
          return numValue.toString();
        }
        // Handle rooms with decimals
        if (field.name === 'rooms') {
          return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1);
        }

        const absoluteValue = Math.abs(numValue);
        // Handle floor
        if (field.name === 'floor') {
          return numValue === 0
            ? t`Ground Floor`
            : numValue > 0
              ? numValue.toString()
              : t`Basement ${absoluteValue}`;
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
        return String(value);

      case 'SELECT':
        // Handle enumerated fields that need capitalization
        if (
          [
            'category',
            'offerType',
            'stage',
            'priceUnit',
            'apartmentSubtype',
            'houseSubtype',
            'parkingSubtype',
            'propertySubtype',
            'agricultureSubtype',
            'industrialSubtype',
            'gastronomySubtype',
            'secondaryRoomsSubtype',
            'plotSubtype',
          ].includes(field.name)
        ) {
          const formatted = capitalize(String(value).toLowerCase());
          // Special handling for price unit
          if (field.name === 'priceUnit') {
            return formatted === 'Sell'
              ? t`For Sale`
              : formatted === 'Sell_square_meter'
                ? t`For Sale (per m²)`
                : formatted;
          }
          return formatted;
        }
        return String(value);

      case 'MULTI_SELECT':
        if (field.name === 'features') {
          return Array.isArray(value)
            ? value.map((v) => capitalize(String(v).toLowerCase())).join(t`, `)
            : String(value);
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
        : (String(value) ?? null);
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

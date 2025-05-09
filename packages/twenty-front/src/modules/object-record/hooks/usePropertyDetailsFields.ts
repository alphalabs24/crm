import { useSubcategoryByCategory } from '@/object-record/record-show/hooks/useSubcategoryByCategory';
import { useMemo } from 'react';

type FieldGroup = {
  fields: string[];
};

export const usePropertyDetailsFields = (record: any) => {
  const subType = useSubcategoryByCategory(record?.category);
  return useMemo(() => {
    const finances = [];

    // Check Price Unit to show either price or rent
    if (
      record?.priceUnit?.toLowerCase() === 'sell' ||
      record?.priceUnit?.toLowerCase() === 'sell_square_meter'
    ) {
      finances.push('sellingPrice', 'valuation');
    } else {
      finances.push('rentNet', 'rentExtra');
    }

    const groups: Record<string, FieldGroup> = {
      'Key Details': {
        fields: [
          'category',
          ...(subType ? [subType] : []),
          'refProperty',
          'availableFrom',
          'stage',
        ],
      },
      'Space Details': {
        fields: ['surface', 'livingSurface', 'hallHeight', 'ceilingHeight'],
      },
      'Object Info': {
        fields: [
          'floor',
          'rooms',
          'constructionYear',
          'renovationYear',
          'numberOfFloors',
        ],
      },
      Financial: {
        fields: ['priceUnit', ...finances],
      },
      Features: {
        fields: ['features'],
      },
    };

    // Filter out empty groups and undefined fields
    const filteredGroups = Object.entries(groups).reduce(
      (acc, [key, group]) => {
        const filteredFields = group.fields.filter(
          (field) => field !== undefined && field !== null,
        );
        if (filteredFields.length > 0) {
          acc[key] = {
            ...group,
            fields: filteredFields,
          };
        }
        return acc;
      },
      {} as Record<string, FieldGroup>,
    );

    return filteredGroups;
  }, [record?.priceUnit, subType]);
};

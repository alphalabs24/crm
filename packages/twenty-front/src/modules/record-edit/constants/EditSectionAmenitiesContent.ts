import { FinancialOverviewGroup } from '@/record-edit/constants/snippets/FinancialOverviewGroup';
import { PropertyCategoryGroup } from '@/record-edit/constants/snippets/PropertyCategoryGroup';
import { SectionContent } from '@/record-edit/types/EditSectionTypes';

export const AMENITIES_SECTION_CONTENT: SectionContent[] = [
  {
    title: 'Building Details',
    width: 'half',
    groups: [
      PropertyCategoryGroup,
      {
        isHorizontal: true,
        fields: [
          { name: 'constructionYear', type: 'input', fieldWidth: 120 },
          { name: 'renovationYear', type: 'input', fieldWidth: 120 },
          {
            name: 'numberOfFloors',
            type: 'input',
            fieldWidth: 140,
            conditionFields: ['category'],
            conditionValues: [
              'house',
              'apartment',
              'agriculture',
              'gastronomy',
              'industrial_objects',
              'parking_space',
            ],
          },
        ],
      },
      {
        isHorizontal: true,
        fields: [
          {
            name: 'floor',
            type: 'input',
            fieldWidth: 80,
            conditionFields: ['category'],
            conditionValues: [
              'apartment',
              'industrial_objects',
              'gastronomy',
              'parking_space',
            ],
          },
          {
            name: 'ceilingHeight',
            type: 'input',
            fieldWidth: 120,
          },
          { name: 'hallHeight', type: 'input', fieldWidth: 120 },
        ],
      },
    ],
  },

  {
    title: 'Technical Specifications',
    width: 'half',
    groups: [
      {
        isHorizontal: true,
        fields: [
          { name: 'maximalFloorLoading', type: 'input', fieldWidth: 160 },
          { name: 'carryingCapacityCrane', type: 'input', fieldWidth: 160 },
          { name: 'carryingCapacityElevator', type: 'input', fieldWidth: 160 },
        ],
      },
    ],
  },
  {
    title: 'Financial Details',
    width: 'half',
    groups: [
      FinancialOverviewGroup,
      {
        isHorizontal: true,
        fields: [{ name: 'valuation', type: 'input', fieldWidth: 140 }],
      },
    ],
  },
  {
    title: 'Stakeholders',
    width: 'half',
    groups: [
      {
        isHorizontal: true,
        fields: [
          { name: 'seller', type: 'field' },
          { name: 'agency', type: 'field' },
          { name: 'assignee', type: 'field' },
        ],
      },
      {
        fields: [{ name: 'buyerLeads', type: 'field' }],
      },
    ],
  },
  {
    title: 'Property Features',
    width: 'full',
    groups: [
      {
        fields: [{ name: 'features', type: 'field' }],
      },
    ],
  },
];

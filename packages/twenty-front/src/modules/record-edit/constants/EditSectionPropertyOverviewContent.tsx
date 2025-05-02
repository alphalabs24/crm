import { FinancialOverviewGroup } from '@/record-edit/constants/snippets/FinancialOverviewGroup';
import { PropertyCategoryGroup } from '@/record-edit/constants/snippets/PropertyCategoryGroup';
import { SectionContent } from '@/record-edit/types/EditSectionTypes';
import { Trans } from '@lingui/react/macro';

// TODO use graphql types of standard entities to reference the field names!
// Field will use inline fields and input will use form inputs
export const OVERVIEW_SECTION_CONTENT: SectionContent[] = [
  {
    title: 'Media',
    width: 'half',
    groups: [
      {
        fields: [
          { name: 'pictures', type: 'custom' },
          { name: 'videos', type: 'custom' },
        ],
      },
    ],
  },
  {
    title: 'Basic Information',
    width: 'half',
    groups: [
      {
        fields: [
          { name: 'name', type: 'input', fieldWidth: 0, required: true },
          { name: 'description', type: 'custom', fieldWidth: 0 },
        ],
      },
      {
        isHorizontal: true,
        fields: [
          { name: 'stage', type: 'field', omitForPublication: true },
          { name: 'availableFrom', type: 'field' },
        ],
      },
    ],
  },
  {
    title: 'Building Details',
    width: 'twoThirds',
    groups: [
      PropertyCategoryGroup,

      {
        isHorizontal: true,
        fields: [
          { name: 'rooms', type: 'input', fieldWidth: 120 },
          { name: 'surface', type: 'input', fieldWidth: 120 },
          { name: 'livingSurface', type: 'input', fieldWidth: 120 },
          { name: 'volume', type: 'input', fieldWidth: 120 },
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
    ],
  },

  {
    title: 'Technical Specifications',
    width: 'third',
    groups: [
      {
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
    title: 'Location',
    width: 'half',
    description: (
      <Trans>
        The location of the property. These fields are <strong>required</strong>{' '}
        in order to publish. (Except for the secondary address field)
      </Trans>
    ),
    groups: [
      {
        fields: [{ name: 'address', type: 'input', hideLabel: true }],
      },
    ],
  },

  {
    title: 'Property Features',
    width: 'half',
    groups: [
      {
        fields: [{ name: 'features', type: 'field' }],
      },
    ],
  },
  {
    title: 'Stakeholders',
    width: 'half',
    omitForPublications: true,
    groups: [
      {
        isHorizontal: true,
        fields: [
          { name: 'seller', type: 'field' },
          { name: 'agency', type: 'field' },
          { name: 'assignee', type: 'field', omitForPublication: true },
        ],
      },
    ],
  },
];

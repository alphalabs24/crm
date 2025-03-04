import { FinancialOverviewGroup } from '@/record-edit/constants/snippets/FinancialOverviewGroup';
import { SectionContent } from '@/record-edit/types/EditSectionTypes';
import { PropertyCategoryGroup } from './snippets/PropertyCategoryGroup';

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
          { name: 'name', type: 'input', fieldWidth: 0 },
          { name: 'description', type: 'multiLine', fieldWidth: 0 },
        ],
      },
    ],
  },

  {
    title: 'Stakeholders',
    width: 'third',
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
    title: 'Key Numbers',
    width: 'third',
    groups: [
      PropertyCategoryGroup,
      {
        isHorizontal: true,
        fields: [
          { name: 'rooms', type: 'input', fieldWidth: 80 },
          { name: 'surface', type: 'input', fieldWidth: 120 },
        ],
      },
      {
        isHorizontal: true,
        fields: [
          { name: 'volume', type: 'input', fieldWidth: 120 },
          { name: 'numberOfFloors', type: 'input', fieldWidth: 150 },
        ],
      },
      FinancialOverviewGroup,
    ],
  },
  {
    title: 'Location',
    width: 'third',
    groups: [
      {
        fields: [
          { name: 'address', type: 'input', hideLabel: true },
          { name: 'availableFrom', type: 'field' },
        ],
      },
    ],
  },
];

import { SectionContent } from '@/record-edit/types/EditSectionTypes';

export const HISTORY_SECTION_CONTENT: SectionContent[] = [
  {
    key: 'creation-information',
    title: 'Creation Information',
    groups: [
      {
        isHorizontal: true,
        fields: [
          { name: 'createdBy', type: 'field' },
          { name: 'creationDate', type: 'field' },
        ],
      },
    ],
  },
  {
    key: 'last-update',
    title: 'Last Update',
    groups: [
      {
        isHorizontal: true,
        fields: [{ name: 'lastUpdate', type: 'field' }],
      },
    ],
  },
  {
    key: 'reference-information',
    title: 'Reference Information',
    groups: [
      {
        isHorizontal: true,
        fields: [{ name: 'refProperty', type: 'input', fieldWidth: 160 }],
      },
    ],
  },
  {
    key: 'status',
    title: 'Status',
    groups: [
      {
        isHorizontal: true,
        fields: [{ name: 'deletedAt', type: 'field' }],
      },
    ],
  },
];

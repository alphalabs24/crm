import { SectionContent } from '@/record-edit/types/EditSectionTypes';

export const DOCUMENTS_SECTION_CONTENT: SectionContent[] = [
  {
    key: 'documents',
    title: 'Documents',
    width: 'half',
    groups: [
      {
        fields: [{ name: 'documents', type: 'custom' }],
      },
    ],
  },
  {
    key: 'external-links',
    title: 'External Links',
    width: 'half',
    groups: [
      {
        fields: [{ name: 'links', type: 'field' }],
      },
      {
        fields: [{ name: 'virtualTour', type: 'field' }],
      },
      {
        fields: [
          {
            name: 'movies',
            type: 'custom',
          },
        ],
      },
    ],
  },
];

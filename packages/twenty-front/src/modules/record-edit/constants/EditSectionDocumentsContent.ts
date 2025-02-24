import { SectionContent } from '@/record-edit/types/EditSectionTypes';

export const DOCUMENTS_SECTION_CONTENT: SectionContent[] = [
  {
    title: 'External Links',
    width: 'third',
    groups: [
      {
        fields: [{ name: 'links', type: 'field' }],
      },
      {
        fields: [{ name: 'virtualTour', type: 'field' }],
      },
    ],
  },
];

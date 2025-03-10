import { SectionContent } from '@/record-edit/types/EditSectionTypes';

export const EMAILS_SECTION_CONTENT: SectionContent[] = [
  {
    title: 'Emails',
    width: 'half',
    groups: [
      {
        fields: [
          { name: 'emailSender', type: 'field', fieldWidth: 0 },
          { name: 'emailTemplate', type: 'custom', fieldWidth: 0 },
        ],
      },
    ],
  },
];

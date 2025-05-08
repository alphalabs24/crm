import { SectionContent } from '@/record-edit/types/EditSectionTypes';
import { Trans } from '@lingui/react/macro';

export const EMAILS_SECTION_CONTENT: SectionContent[] = [
  {
    key: 'emails',
    title: 'Emails',
    width: 'half',
    description: (
      <Trans>
        Set up an email template to send to interested buyers when they inquire
        about this property.
      </Trans>
    ),
    groups: [
      {
        fields: [
          { name: 'emailSender', type: 'field', fieldWidth: 0 },
          {
            name: 'emailTemplate',
            type: 'custom',
            fieldWidth: 0,
            conditionFields: ['emailSender'],
          },
        ],
      },
    ],
  },
];

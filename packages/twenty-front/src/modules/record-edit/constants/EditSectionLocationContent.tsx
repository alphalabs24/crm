import { SectionContent } from '@/record-edit/types/EditSectionTypes';
import { Trans } from '@lingui/react/macro';

export const LOCATION_SECTION_CONTENT: SectionContent[] = [
  {
    title: 'Location',
    width: 'third',
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
    title: 'Key Distances',
    groups: [
      // TODO: Add distances
    ],
  },
];

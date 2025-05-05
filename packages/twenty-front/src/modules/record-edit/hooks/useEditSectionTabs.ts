import { useLingui } from '@lingui/react/macro';
import { IconFile, IconHome, IconMail } from 'twenty-ui';
import { OVERVIEW_SECTION_CONTENT } from '../constants/EditSectionPropertyOverviewContent';
import { DOCUMENTS_SECTION_CONTENT } from '../constants/EditSectionDocumentsContent';
import { EMAILS_SECTION_CONTENT } from '../constants/EditSectionEmailsContent';

export const useEditSectionTabs = () => {
  const { t } = useLingui();

  return [
    {
      id: 'property-overview',
      title: t`Overview`,
      Icon: IconHome,
      content: OVERVIEW_SECTION_CONTENT,
    },
    /* {
    id: 'property-location',
    title: 'Location',
    Icon: IconMap,
    content: LOCATION_SECTION_CONTENT,
  }, */
    {
      id: 'property-emails',
      title: t`Emails`,
      Icon: IconMail,
      content: EMAILS_SECTION_CONTENT,
    },
    {
      id: 'property-documents',
      title: t`Documents & Links`,
      Icon: IconFile,
      content: DOCUMENTS_SECTION_CONTENT,
    },
  ];
};

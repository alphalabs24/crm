import { Section } from '@/record-edit/types/EditSectionTypes';
import {
  IconBuildingSkyscraper,
  IconFile,
  IconHome,
  IconMail,
  IconMap,
} from 'twenty-ui';
import { AMENITIES_SECTION_CONTENT } from './EditSectionAmenitiesContent';
import { DOCUMENTS_SECTION_CONTENT } from './EditSectionDocumentsContent';
import { LOCATION_SECTION_CONTENT } from './EditSectionLocationContent';
import { OVERVIEW_SECTION_CONTENT } from './EditSectionPropertyOverviewContent';
import { EMAILS_SECTION_CONTENT } from './EditSectionEmailsContent';

export const EDIT_SECTIONS_TABS: Section[] = [
  {
    id: 'property-overview',
    title: 'Overview',
    Icon: IconHome,
    content: OVERVIEW_SECTION_CONTENT,
  },
  {
    id: 'property-amenities',
    title: 'Features & Details',
    Icon: IconBuildingSkyscraper,
    content: AMENITIES_SECTION_CONTENT,
  },
  {
    id: 'property-location',
    title: 'Location',
    Icon: IconMap,
    content: LOCATION_SECTION_CONTENT,
  },
  {
    id: 'property-emails',
    title: 'Emails',
    Icon: IconMail,
    content: EMAILS_SECTION_CONTENT,
  },
  {
    id: 'property-documents',
    title: 'Documents & Links',
    Icon: IconFile,
    content: DOCUMENTS_SECTION_CONTENT,
  },
];

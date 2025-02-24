import { Section } from '@/record-edit/types/EditSectionTypes';
import {
  IconBuildingSkyscraper,
  IconFile,
  IconHome,
  IconLink,
  IconMap,
} from 'twenty-ui';
import { AMENITIES_SECTION_CONTENT } from './EditSectionAmenitiesContent';
import { DOCUMENTS_SECTION_CONTENT } from './EditSectionDocumentsContent';
import { LOCATION_SECTION_CONTENT } from './EditSectionLocationContent';
import { OVERVIEW_SECTION_CONTENT } from './EditSectionPropertyOverviewContent';

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
    id: 'property-documents',
    title: 'Links',
    Icon: IconLink,
    content: DOCUMENTS_SECTION_CONTENT,
  },
];

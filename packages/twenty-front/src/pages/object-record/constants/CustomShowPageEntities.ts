import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

// These enum values semantically define what type of property is being passed. Each of them has exactly one semantic meaning!
export enum RedirectParam {
  ObjectNamePlural = 'objectNamePlural',
  // object name singular of entity
  ObjectNameSingular = 'objectNameSingular',
  // object record id of entity
  ObjectRecordId = 'objectRecordId',
  // property id on publication
  PropertyId = 'propertyId',
  // always "properties"
  PropertyObjectNamePlural = 'propertyObjectNamePlural',
  // always "property"
  PropertyObjectNameSingular = 'propertyObjectNameSingular',
  // platform id on publication
  PlatformId = 'platform',
}

type CustomShowPageEntitiesType = {
  [key in CoreObjectNameSingular]?: {
    guardedForFieldValues?: {
      [key: string]: string[];
    };
    redirectTo: {
      path: string;
      params?: {
        // The semantic keys are mapped to actual param names (not values) --> value is inferred through semantic meaning of the key
        [key in RedirectParam]?: string;
      };
      searchParams?: {
        // The semantic keys are mapped to actual search param names (not values) --> value is inferred through semantic meaning of the key
        [key in RedirectParam]?: string;
      };
      // Sets a hash param in the URL (used for example for tab selection in the show page)
      hashParam?: string;
    };
  };
};

// This configuration can be used to route to correct pages based on entity type and specific field values.
// It also ensures that the show page is guarded for the given field values so no unintended access is possible.
export const CUSTOM_SHOW_PAGE_ENTITIES: CustomShowPageEntitiesType = {
  [CoreObjectNameSingular.Property]: {
    redirectTo: {
      path: AppPath.RecordShowPropertyPage,
      params: {
        [RedirectParam.ObjectNameSingular]: 'objectNameSingular',
        [RedirectParam.ObjectRecordId]: 'objectRecordId',
      },
    },
  },
  [CoreObjectNameSingular.Publication]: {
    redirectTo: {
      path: AppPath.RecordShowPropertyPage,
      params: {
        [RedirectParam.PropertyObjectNameSingular]: 'objectNameSingular',
        [RedirectParam.PropertyId]: 'objectRecordId',
      },
      searchParams: {
        [RedirectParam.PlatformId]: 'platform',
      },
      hashParam: 'publications',
    },
  },
  [CoreObjectNameSingular.BuyerLead]: {
    redirectTo: {
      path: AppPath.RecordInquiriesPage,
      params: {
        [RedirectParam.ObjectRecordId]: 'id',
      },
    },
  },
  // Never show credentials show page
  [CoreObjectNameSingular.Credential]: {
    redirectTo: {
      path: AppPath.NotFound,
    },
  },
  [CoreObjectNameSingular.Agency]: {
    redirectTo: {
      path: getSettingsPath(SettingsPath.Platforms),
      searchParams: {
        [RedirectParam.ObjectRecordId]: 'id',
      },
    },
  },
  [CoreObjectNameSingular.Note]: {
    redirectTo: {
      path: SettingsPath.EmailTemplateEdit,
      params: {
        [RedirectParam.ObjectRecordId]: 'emailTemplateId',
      },
    },
    // If we are looking at an email template, we should redirect to the email templates page instead of the notes show page.
    guardedForFieldValues: {
      type: ['EmailTemplate'],
    },
  },
};

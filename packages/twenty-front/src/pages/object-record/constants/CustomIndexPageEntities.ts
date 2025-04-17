import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { RedirectParam } from '~/pages/object-record/constants/CustomShowPageEntities';

type CustomIndexPageEntitiesType = {
  [key in CoreObjectNameSingular]?: {
    redirectTo: {
      path: string;
      params?: {
        // The semantic keys are mapped to actual param names (not values) --> value is inferred through semantic meaning of the key
        [key in RedirectParam]?: string;
      };
    };
  };
};

// This configuration ensures that the index page is guarded for the given field values so no unintended access is possible.
export const CUSTOM_INDEX_PAGE_ENTITIES: CustomIndexPageEntitiesType = {
  [CoreObjectNameSingular.Property]: {
    redirectTo: {
      path: AppPath.RecordIndexPage,
      params: {
        [RedirectParam.PropertyObjectNamePlural]: 'objectNamePlural',
      },
    },
  },
  [CoreObjectNameSingular.Publication]: {
    redirectTo: {
      path: AppPath.RecordIndexPage,
      params: {
        [RedirectParam.PropertyObjectNamePlural]: 'objectNamePlural',
      },
    },
  },
  [CoreObjectNameSingular.BuyerLead]: {
    redirectTo: {
      path: AppPath.RecordInquiriesPage,
    },
  },
  [CoreObjectNameSingular.Credential]: {
    redirectTo: {
      path: AppPath.RecordIndexPage,
      params: {
        [RedirectParam.PropertyObjectNamePlural]: 'objectNamePlural',
      },
    },
  },
  [CoreObjectNameSingular.Agency]: {
    redirectTo: {
      path: SettingsPath.Platforms,
    },
  },
};

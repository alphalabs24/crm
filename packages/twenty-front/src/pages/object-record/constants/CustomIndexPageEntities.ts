import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { RedirectParam } from '~/pages/object-record/constants/CustomShowPageEntities';

type CustomIndexPageEntitiesType = {
  [key in CoreObjectNamePlural]?: {
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
  [CoreObjectNamePlural.Publication]: {
    redirectTo: {
      path: AppPath.RecordIndexPage,
      params: {
        [RedirectParam.PropertyObjectNamePlural]: 'objectNamePlural',
      },
    },
  },
  [CoreObjectNamePlural.BuyerLead]: {
    redirectTo: {
      path: AppPath.RecordInquiriesPage,
    },
  },
  [CoreObjectNamePlural.Credential]: {
    redirectTo: {
      path: AppPath.RecordIndexPage,
      params: {
        [RedirectParam.PropertyObjectNamePlural]: 'objectNamePlural',
      },
    },
  },
  [CoreObjectNamePlural.Agency]: {
    redirectTo: {
      path: AppPath.Tutorial,
    },
  },
};

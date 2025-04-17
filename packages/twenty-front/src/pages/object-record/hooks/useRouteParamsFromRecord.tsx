import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AppPath } from '@/types/AppPath';
import { getAppPath } from '~/utils/navigation/getAppPath';
import { useMemo } from 'react';
import { CUSTOM_INDEX_PAGE_ENTITIES } from '~/pages/object-record/constants/CustomIndexPageEntities';
import {
  CUSTOM_SHOW_PAGE_ENTITIES,
  RedirectParam,
} from '~/pages/object-record/constants/CustomShowPageEntities';

type RouteParams = {
  params: Record<string, string | undefined>;
  searchParams: Record<string, string>;
  hashParam: string | undefined;
};

// Helper function to get the value for a redirect parameter
const getValueForRedirectParam = (
  paramKey: RedirectParam,
  record?: ObjectRecord | null,
  objectNamePlural?: string,
  objectNameSingular?: string,
): string | undefined => {
  // Semantic matching to value
  switch (paramKey) {
    case RedirectParam.ObjectNamePlural:
      return objectNamePlural;
    case RedirectParam.ObjectNameSingular:
      return objectNameSingular;
    case RedirectParam.ObjectRecordId:
      return record?.id;
    case RedirectParam.PropertyId:
      return record?.propertyId;
    case RedirectParam.PropertyObjectNamePlural:
      return CoreObjectNamePlural.Property;
    case RedirectParam.PropertyObjectNameSingular:
      return CoreObjectNameSingular.Property;
    case RedirectParam.PlatformId:
      return record?.platform;
    default:
      return undefined;
  }
};

// Helper function to process params from a spec object
const processParamsWithSpec = <T extends Record<string, any>>(
  spec: Record<string, string> | undefined,
  record?: ObjectRecord | null,
  objectNamePlural?: string,
  objectNameSingular?: string,
): T => {
  if (!spec) return {} as T;

  return Object.keys(spec).reduce((acc, key) => {
    // Actual value for the param
    const value = getValueForRedirectParam(
      key as RedirectParam,
      record,
      objectNamePlural,
      objectNameSingular,
    );

    // Actual key for the param
    const paramKey = spec[key as RedirectParam];
    // Only include if paramKey exists and (value is defined or we allow undefined values)
    if (paramKey && value !== undefined) {
      return {
        ...acc,
        [paramKey]: value,
      };
    }
    return acc;
  }, {} as T);
};

export const useRouteParamsFromRecord = (
  record?: ObjectRecord | null,
  objectNamePlural?: string,
  objectNameSingular?: string,
  // optionally you can overwrite behavior.
  type?: 'show' | 'index',
) => {
  const isIndexPage = useMemo(() => {
    if (type === 'index') {
      return true;
    }

    return Boolean(objectNamePlural);
  }, [objectNamePlural, type]);

  const isShowPage = useMemo(() => {
    if (type === 'show') {
      return true;
    }

    if (Boolean(objectNameSingular) && Boolean(record?.id)) {
      return true;
    }

    return false;
  }, [objectNameSingular, record, type]);

  const to = useMemo(() => {
    if (isShowPage) {
      return CUSTOM_SHOW_PAGE_ENTITIES[
        objectNameSingular as CoreObjectNameSingular
      ]?.redirectTo.path;
    }

    if (isIndexPage) {
      return CUSTOM_INDEX_PAGE_ENTITIES[
        objectNamePlural as CoreObjectNamePlural
      ]?.redirectTo.path;
    }
  }, [isShowPage, isIndexPage, objectNameSingular, objectNamePlural]);

  const routeParams: RouteParams = useMemo(() => {
    if (isShowPage) {
      const paramSpec =
        CUSTOM_SHOW_PAGE_ENTITIES[objectNameSingular as CoreObjectNameSingular]
          ?.redirectTo.params;
      const searchParamSpec =
        CUSTOM_SHOW_PAGE_ENTITIES[objectNameSingular as CoreObjectNameSingular]
          ?.redirectTo.searchParams;
      const hashParamSpec =
        CUSTOM_SHOW_PAGE_ENTITIES[objectNameSingular as CoreObjectNameSingular]
          ?.redirectTo.hashParam;

      return {
        params: processParamsWithSpec<Record<string, string | undefined>>(
          paramSpec,
          record,
          objectNamePlural,
          objectNameSingular,
        ),
        searchParams: processParamsWithSpec<Record<string, string>>(
          searchParamSpec,
          record,
          objectNamePlural,
          objectNameSingular,
        ),
        hashParam: hashParamSpec || undefined,
      };
    }

    if (isIndexPage) {
      const paramSpec =
        CUSTOM_INDEX_PAGE_ENTITIES[objectNamePlural as CoreObjectNamePlural]
          ?.redirectTo.params;

      return {
        params: processParamsWithSpec<Record<string, string | undefined>>(
          paramSpec,
          record,
          objectNamePlural,
          objectNameSingular,
        ),
        searchParams: {},
        hashParam: undefined,
      };
    }

    // Default return for other cases
    return {
      params: {},
      searchParams: {},
      hashParam: undefined,
    };
  }, [isShowPage, isIndexPage, objectNameSingular, objectNamePlural, record]);

  const fullPath = useMemo(() => {
    if (!to) return '';

    try {
      // Generate path with params using getAppPath
      const pathWithParams = getAppPath(
        to as AppPath,
        routeParams.params as any, // Cast to any to bypass type checking for now
        routeParams.searchParams,
      );

      // Add hash if it exists
      const hashString = routeParams.hashParam
        ? routeParams.hashParam.includes('#')
          ? routeParams.hashParam
          : `#${routeParams.hashParam}`
        : '';

      return `${pathWithParams}${hashString}`;
    } catch (error) {
      console.error('Error generating path:', error);
      return '';
    }
  }, [to, routeParams]);

  return {
    to,
    fullPath,
    routeParams,
    isIndexPage,
    isShowPage,
  };
};

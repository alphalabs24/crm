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

// Helper function to check if a record matches the guardedForFieldValues conditions
const recordMatchesGuardedValues = (
  record?: ObjectRecord | null,
  objectNameSingular?: string,
): boolean => {
  if (!record || !objectNameSingular) return true; // If no record or objectNameSingular, don't block

  const guardedValues =
    CUSTOM_SHOW_PAGE_ENTITIES[objectNameSingular as CoreObjectNameSingular]
      ?.guardedForFieldValues;

  // If no guarded values defined, allow all records
  if (!guardedValues) return true;

  // Check each field defined in guardedForFieldValues
  return Object.entries(guardedValues).every(([fieldName, allowedValues]) => {
    // Get the actual value from the record
    const recordValue = record[fieldName];

    // If the field doesn't exist in the record, it doesn't match
    if (recordValue === undefined) return false;

    // Check if the record's value is in the list of allowed values
    return allowedValues.includes(recordValue);
  });
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

  // Check if the record matches any guarded field values
  const isAllowedByGuard = useMemo(() => {
    return recordMatchesGuardedValues(record, objectNameSingular);
  }, [record, objectNameSingular]);

  const to = useMemo(() => {
    // If the record doesn't match guarded values, don't return a redirect path
    if (isShowPage && !isAllowedByGuard) {
      return undefined;
    }

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

    return undefined;
  }, [
    isShowPage,
    isIndexPage,
    objectNameSingular,
    objectNamePlural,
    isAllowedByGuard,
  ]);

  const routeParams: RouteParams = useMemo(() => {
    if (isShowPage && isAllowedByGuard) {
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
  }, [
    isShowPage,
    isIndexPage,
    objectNameSingular,
    objectNamePlural,
    record,
    isAllowedByGuard,
  ]);

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
    isAllowedByGuard,
  };
};

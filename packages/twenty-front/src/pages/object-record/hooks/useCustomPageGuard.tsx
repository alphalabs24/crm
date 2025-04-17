import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteParamsFromRecord } from '~/pages/object-record/hooks/useRouteParamsFromRecord';

type Props = {
  objectNameSingular?: string;
  objectNamePlural?: string;
  record?: ObjectRecord;
};

export const useCustomPageGuard = ({
  objectNameSingular,
  objectNamePlural,
  record,
}: Props) => {
  const navigate = useNavigate();

  const { to, routeParams } = useRouteParamsFromRecord(
    record,
    objectNamePlural,
    objectNameSingular,
  );

  useEffect(() => {
    if (!to) return;

    // Build the full URL with search params
    const searchParamsString = new URLSearchParams(
      routeParams.searchParams,
    ).toString();
    const hashString = routeParams.hashParam
      ? routeParams.hashParam.includes('#')
        ? routeParams.hashParam
        : `#${routeParams.hashParam}`
      : '';

    // Replace params in the path
    let finalPath = to;
    Object.entries(routeParams.params).forEach(([key, value]) => {
      if (value !== undefined) {
        finalPath = finalPath.replace(`:${key}`, value);
      }
    });

    // Add search params and hash if they exist
    const fullPath = `${finalPath}${searchParamsString ? `?${searchParamsString}` : ''}${hashString}`;

    navigate(fullPath);
  }, [to, routeParams, navigate]);
};

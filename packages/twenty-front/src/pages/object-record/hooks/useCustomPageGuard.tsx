import { usePrevious } from '@/hooks/local-state/usePrevious';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRouteParamsFromRecord } from '~/pages/object-record/hooks/useRouteParamsFromRecord';

type Props = {
  objectNameSingular?: string;
  objectNamePlural?: string;
  record?: ObjectRecord | null;
};

export const useCustomPageGuard = ({
  objectNameSingular,
  objectNamePlural,
  record,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocation = usePrevious(location.pathname);
  const hasInitializedRef = useRef(false);

  const { fullPath } = useRouteParamsFromRecord(
    record,
    objectNamePlural,
    objectNameSingular,
  );

  useEffect(() => {
    // Skip the first render to allow context to fully initialize
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }

    // Skip if we're actively navigating between different object types
    // This prevents redirecting when the store hasn't caught up yet
    const isNavigatingBetweenObjects =
      prevLocation && location.pathname !== prevLocation;

    if (isNavigatingBetweenObjects) {
      return;
    }

    // Only navigate if we need to go to a different path
    if (fullPath && location.pathname !== fullPath) {
      navigate(fullPath);
    }
  }, [
    navigate,
    fullPath,
    location.pathname,
    prevLocation,
    objectNameSingular,
    objectNamePlural,
    record?.id,
  ]);
};

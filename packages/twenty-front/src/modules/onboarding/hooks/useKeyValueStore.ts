import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import {
  useGetCurrentUserKeyValueStoreQuery,
  useSetUserVarMutation,
} from '~/generated/graphql';
import { keyValueStoreState } from '../states/keyValueStoreState';

export const useKeyValueStore = () => {
  const [setUserVar] = useSetUserVarMutation();
  // TODO Check why the whole page reloads on creating a new agency
  const { data, error } = useGetCurrentUserKeyValueStoreQuery({
    fetchPolicy: 'cache-first', // Only fetch from network if not in cache
  });
  const [keyValueStore, setKeyValueStore] = useRecoilState(keyValueStoreState);

  // Sync server data with Recoil state
  useEffect(() => {
    if (data?.currentUser?.userVars) {
      setKeyValueStore((prev) => ({
        ...prev,
        ...data.currentUser.userVars,
      }));
    }
  }, [data?.currentUser?.userVars, setKeyValueStore]);

  const getValueByKey = (key: string) => {
    return keyValueStore[key];
  };

  const setValueByKey = async (
    key: string,
    value: string | boolean | number,
  ) => {
    // Update Recoil state immediately for optimistic updates
    setKeyValueStore((prev) => ({ ...prev, [key]: value }));

    // Update backend
    try {
      await setUserVar({
        variables: {
          key,
          value,
        },
      });
    } catch (error) {
      // Revert optimistic update on error
      setKeyValueStore((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      throw error;
    }
  };

  return {
    getValueByKey,
    setValueByKey,
    error,
  };
};

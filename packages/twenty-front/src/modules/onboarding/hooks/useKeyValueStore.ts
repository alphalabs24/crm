import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import {
  useGetCurrentUserKeyValueStoreQuery,
  useSetUserVarMutation,
} from '~/generated/graphql';
import { keyValueStoreState } from '../states/keyValueStoreState';

export const useKeyValueStore = () => {
  const [setUserVar] = useSetUserVarMutation();
  const { data, error } = useGetCurrentUserKeyValueStoreQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
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
    // Only update if value is different from current value
    if (keyValueStore[key] === value) {
      return;
    }
    // Update Recoil state immediately for optimistic updates
    setKeyValueStore((prev) => ({ ...prev, [key]: value }));

    // Update backend
    try {
      await setUserVar({
        variables: {
          key,
          value,
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData) return;

          // Update only the userVars field in the cache
          cache.modify({
            id: cache.identify({
              __typename: 'User',
              id: data?.currentUser?.id,
            }),
            fields: {
              userVars: (existing) => ({
                ...existing,
                [key]: value,
              }),
            },
          });
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

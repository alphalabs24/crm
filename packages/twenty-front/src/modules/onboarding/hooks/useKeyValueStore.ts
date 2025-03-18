import { currentUserState } from '@/auth/states/currentUserState';
import { useRecoilValue } from 'recoil';
import { useSetUserVarMutation } from '~/generated/graphql';

export const useKeyValueStore = () => {
  const currentUser = useRecoilValue(currentUserState);
  const [setUserVar] = useSetUserVarMutation();

  const getValueByKey = (key: string) => {
    return currentUser?.userVars[key];
  };

  const setValueByKey = (key: string, value: string | boolean | number) => {
    setUserVar({
      variables: {
        key,
        value,
      },
    });
  };

  return { getValueByKey, setValueByKey };
};

import { createState } from 'twenty-ui';

export const keyValueStoreState = createState<
  Record<string, string | boolean | number>
>({
  key: 'keyValueStoreState',
  defaultValue: {},
});

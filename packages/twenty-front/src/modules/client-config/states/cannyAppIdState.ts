import { atom } from 'recoil';

export const cannyAppIdState = atom<string | undefined | null>({
  key: 'cannyAppIdState',
  default: undefined,
});

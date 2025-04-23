import { atom } from 'recoil';

export const mapboxAccessTokenState = atom<string | undefined | null>({
  key: 'mapboxAccessTokenState',
  default: undefined,
});

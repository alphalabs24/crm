import { gql } from '@apollo/client';

export type GetCurrentUserKeyValueStoreQuery = {
  currentUser: {
    id: string;
    userVars: Record<string, string | boolean | number>;
  } | null;
};

export const GET_CURRENT_USER_KEY_VALUE_STORE = gql`
  query GetCurrentUserKeyValueStore {
    currentUser {
      id
      userVars
    }
  }
`;

import { gql } from '@apollo/client';

export const SET_USER_VAR = gql`
  mutation SetUserVar($key: String!, $value: JSON!) {
    setUserVar(key: $key, value: $value)
  }
`;

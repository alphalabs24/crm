import { tokenPairState } from '@/auth/states/tokenPairState';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { getEnv } from '~/utils/get-env';

/**
 * Hook for interacting with the Nestermind API
 * Uses the authentication token from Recoil state
 */
export const useNestermind = () => {
  const tokenPair = useRecoilValue(tokenPairState);
  const baseUrl =
    getEnv('REACT_APP_NESTERMIND_SERVER_BASE_URL') ?? 'http://api.localhost';

  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
      'Content-Type': 'application/json',
    },
  });

  // Property routes
  const syncPublicationsWithProperty = async (propertyId: string) => {
    return api.post(`/properties/sync?id=${propertyId}`);
  };

  const deleteProperty = async (propertyId: string) => {
    return api.delete(`/properties/delete?id=${propertyId}`);
  };

  const uploadProperty = async (propertyId: string) => {
    return api.post(`/properties/publish?id=${propertyId}`);
  };

  // Health check
  const checkHealth = async () => {
    return api.get('/health');
  };

  // Setup routes
  const createEmailWebhook = async () => {
    return api.post('/setup/create-email-webhook');
  };

  const createWorkspace = async () => {
    return api.post('/setup/create-workspace');
  };

  const publishPublication = async ({
    publicationId,
  }: {
    publicationId: string;
  }) => {
    return api.post(`/publications/upload?id=${publicationId}`);
  };

  const duplicatePublication = async ({
    publicationId,
  }: {
    publicationId: string;
  }) => {
    return api.post(`/publications/duplicate?id=${publicationId}`);
  };

  const deletePublication = async ({
    publicationId,
  }: {
    publicationId: string;
  }) => {
    return api.delete(`/publications/delete?id=${publicationId}`);
  };

  const checkPublications = async (username: string, password: string) => {
    return api.get(
      `/publications/check?username=${username}&password=${password}`,
    );
  };

  // Message routes
  const getRecordMessageThreads = async ({
    id,
    objectNameSingular,
  }: {
    id: string;
    objectNameSingular: string;
  }) => {
    return api.get(
      `/messages/${objectNameSingular}?${objectNameSingular}Id=${id}`,
    );
  };

  return {
    api,
    publications: {
      publish: publishPublication,
      duplicate: duplicatePublication,
      delete: deletePublication,
      check: checkPublications,
    },
    properties: {
      syncPublications: syncPublicationsWithProperty,
      delete: deleteProperty,
      upload: uploadProperty,
    },
    health: {
      check: checkHealth,
    },
    setup: {
      createEmailWebhook,
      createWorkspace,
    },
    messages: {
      getRecordMessageThreads,
    },
  };
};

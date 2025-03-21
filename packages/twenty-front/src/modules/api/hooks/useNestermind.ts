import { tokenPairState } from '@/auth/states/tokenPairState';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { UserTutorialTask } from 'twenty-shared';
import { getEnv } from '~/utils/get-env';

/**
 * Hook for interacting with the Nestermind API
 * Uses the authentication token from Recoil state
 */
export const useNestermind = () => {
  const tokenPair = useRecoilValue(tokenPairState);
  const { setAsCompleted } = useTutorialSteps();
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

  const createPublicationDraftFromProperty = async (
    propertyId: string,
    platform: PlatformId,
  ) => {
    return api.post(
      `/properties/publish?id=${propertyId}&platform=${platform}`,
    );
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
    // TODO: Change this to upload endpoint once we have a sync from platform function!
    const response = await api.post(`/publications/add?id=${publicationId}`);
    setAsCompleted({
      step: UserTutorialTask.TUTORIAL_PUBLICATION,
    });
    return response;
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
    publicationsApi: {
      publish: publishPublication,
      duplicate: duplicatePublication,
      delete: deletePublication,
      check: checkPublications,
    },
    propertiesApi: {
      syncPublications: syncPublicationsWithProperty,
      delete: deleteProperty,
      createPublicationDraft: createPublicationDraftFromProperty,
    },
    healthApi: {
      check: checkHealth,
    },
    setupApi: {
      createEmailWebhook,
      createWorkspace,
    },
    messagesApi: {
      getRecordMessageThreads,
    },
  };
};

import { tokenPairState } from '@/auth/states/tokenPairState';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { UserTutorialTask } from 'twenty-shared';
import { TimelineThread } from '~/generated/graphql';
import { getEnv } from '~/utils/get-env';

/**
 * Hook for interacting with the Nestermind API
 * Uses the authentication token from Recoil state
 * Now uses Tanstack Query for better data fetching, caching, and state management
 */
export const useNestermind = () => {
  const tokenPair = useRecoilValue(tokenPairState);
  const { setAsCompleted } = useTutorialSteps();
  const queryClient = useQueryClient();

  const baseUrl = useMemo(
    () =>
      getEnv('REACT_APP_NESTERMIND_SERVER_BASE_URL') ?? 'http://api.localhost',
    [],
  );

  const api = useMemo(() => {
    return axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
        'Content-Type': 'application/json',
      },
    });
  }, [baseUrl, tokenPair?.accessToken?.token]);

  // Property routes
  const syncPublicationsWithProperty = useCallback(
    async (propertyId: string) => {
      return api.post(`/properties/sync?id=${propertyId}`);
    },
    [api],
  );

  const useSyncPublicationsWithProperty = (
    propertyId: string | null,
    options = {},
  ) => {
    return useMutation({
      mutationFn: () => {
        if (!propertyId) throw new Error('Property ID is required');
        return syncPublicationsWithProperty(propertyId);
      },
      onSuccess: () => {
        // Invalidate relevant queries after successful sync
        queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
        queryClient.invalidateQueries({ queryKey: ['publications'] });
      },
      ...options,
    });
  };

  const deleteProperty = useCallback(
    async (propertyId: string) => {
      return api.delete(`/properties/delete?id=${propertyId}`);
    },
    [api],
  );

  const useDeleteProperty = (propertyId: string | null, options = {}) => {
    return useMutation({
      mutationFn: () => {
        if (!propertyId) throw new Error('Property ID is required');
        return deleteProperty(propertyId);
      },
      onSuccess: () => {
        // Invalidate relevant queries after successful deletion
        queryClient.invalidateQueries({ queryKey: ['properties'] });
      },
      ...options,
    });
  };

  const createPublicationDraftFromProperty = useCallback(
    async (propertyId: string, platform: PlatformId) => {
      return api.post(
        `/properties/publish?id=${propertyId}&platform=${platform}`,
      );
    },
    [api],
  );

  const useCreatePublicationDraft = (options = {}) => {
    return useMutation({
      mutationFn: ({
        propertyId,
        platform,
      }: {
        propertyId: string;
        platform: PlatformId;
      }) => createPublicationDraftFromProperty(propertyId, platform),
      onSuccess: () => {
        // Invalidate relevant queries after successful draft creation
        queryClient.invalidateQueries({ queryKey: ['publications'] });
      },
      ...options,
    });
  };

  // Health check
  const checkHealth = useCallback(async () => {
    return api.get('/health');
  }, [api]);

  const useHealthCheck = (options = {}) => {
    return useQuery({
      queryKey: ['health'],
      queryFn: checkHealth,
      ...options,
    });
  };

  // Setup routes
  const createEmailWebhook = useCallback(async () => {
    return api.post('/setup/create-email-webhook');
  }, [api]);

  const useCreateEmailWebhook = (options = {}) => {
    return useMutation({
      mutationFn: createEmailWebhook,
      ...options,
    });
  };

  const createWorkspace = useCallback(async () => {
    return api.post('/setup/create-workspace');
  }, [api]);

  const useCreateWorkspace = (options = {}) => {
    return useMutation({
      mutationFn: createWorkspace,
      ...options,
    });
  };

  // Publication routes
  const publishPublication = useCallback(
    async ({ publicationId }: { publicationId: string }) => {
      const response = await api.post(`/publications/add?id=${publicationId}`);
      setAsCompleted({
        step: UserTutorialTask.TUTORIAL_PUBLICATION,
      });
      return response;
    },
    [api, setAsCompleted],
  );

  const usePublishPublication = (options = {}) => {
    return useMutation({
      mutationFn: publishPublication,
      onSuccess: () => {
        // Invalidate relevant queries after successful publication
        queryClient.invalidateQueries({ queryKey: ['publications'] });
      },
      ...options,
    });
  };

  const duplicatePublication = useCallback(
    async ({ publicationId }: { publicationId: string }) => {
      return api.post(`/publications/duplicate?id=${publicationId}`);
    },
    [api],
  );

  const useDuplicatePublication = (options = {}) => {
    return useMutation({
      mutationFn: duplicatePublication,
      onSuccess: () => {
        // Invalidate relevant queries after successful duplication
        queryClient.invalidateQueries({ queryKey: ['publications'] });
      },
      ...options,
    });
  };

  const deletePublication = useCallback(
    async ({ publicationId }: { publicationId: string }) => {
      return api.delete(`/publications/delete?id=${publicationId}`);
    },
    [api],
  );

  const useDeletePublication = (options = {}) => {
    return useMutation({
      mutationFn: deletePublication,
      onSuccess: () => {
        // Invalidate relevant queries after successful deletion
        queryClient.invalidateQueries({ queryKey: ['publications'] });
      },
      ...options,
    });
  };

  const checkPublications = useCallback(
    (username: string, password: string) => {
      return api.get(
        `/publications/check?username=${username}&password=${password}`,
      );
    },
    [api],
  );

  const useCheckPublications = (
    username: string | null,
    password: string | null,
    options = {},
  ) => {
    return useQuery({
      queryKey: ['publications', 'check', username, password],
      queryFn: () => {
        if (!username || !password)
          throw new Error('Username and password are required');
        return checkPublications(username, password);
      },
      ...options,
      enabled: !!username && !!password && (options as any).enabled !== false,
    });
  };

  const unpublishPublication = useCallback(
    async ({ publicationId }: { publicationId: string }) => {
      return api.delete(`/publications/unpublish?id=${publicationId}`);
    },
    [api],
  );

  const useUnpublishPublication = (options = {}) => {
    return useMutation({
      mutationFn: unpublishPublication,
      onSuccess: () => {
        // Invalidate relevant queries after successful unpublishing
        queryClient.invalidateQueries({ queryKey: ['publications'] });
      },
      ...options,
    });
  };

  // Message routes
  const getRecordMessageThreads = useCallback(
    async ({
      id,
      objectNameSingular,
    }: {
      id: string;
      objectNameSingular: string;
    }): Promise<AxiosResponse<TimelineThread[] | undefined>> => {
      const response = await api.get(
        `/messages/${objectNameSingular}?${objectNameSingular}Id=${id}`,
      );
      return response.data;
    },
    [api],
  );

  const useRecordMessageThreads = (
    id: string | null,
    objectNameSingular: string | null,
    options = {},
  ) => {
    return useQuery({
      queryKey: ['messages', objectNameSingular, id],
      queryFn: async () => {
        if (!id || !objectNameSingular)
          throw new Error('ID and object name are required');
        const { data } = await api.get(
          `/messages/${objectNameSingular}?${objectNameSingular}Id=${id}`,
        );
        // Convert TimelineThread[] to ThreadWithMessages[]
        return (data || []).map((thread: any) => ({
          ...thread,
          messages: thread.messages || [],
        }));
      },
      ...options,
      enabled:
        !!id && !!objectNameSingular && (options as any).enabled !== false,
    });
  };

  // Email templates routes
  const sendTestEmailPublication = useCallback(
    async ({
      publicationId,
      toEmail,
    }: {
      publicationId: string;
      toEmail: string;
    }) => {
      return api.post(
        `/email-sender/test-autoresponse?publicationId=${publicationId}&email=${toEmail}`,
      );
    },
    [api],
  );

  const useSendTestEmailPublication = (options = {}) => {
    return useMutation({
      mutationFn: sendTestEmailPublication,
      ...options,
    });
  };

  const sendTestEmailProperty = useCallback(
    async ({
      propertyId,
      toEmail,
    }: {
      propertyId: string;
      toEmail: string;
    }) => {
      return api.post(
        `/email-sender/test-autoresponse?propertyId=${propertyId}&email=${toEmail}`,
      );
    },
    [api],
  );

  const useSendTestEmailProperty = (options = {}) => {
    return useMutation({
      mutationFn: sendTestEmailProperty,
      ...options,
    });
  };

  // Metrics routes
  const calculatePublicationMetrics = useCallback(
    async (publicationIds: string[]) => {
      return api.post(`/metrics/publications`, {
        ids: publicationIds,
      });
    },
    [api],
  );

  const usePublicationMetrics = (
    publicationIds: string[] | null,
    options = {},
  ) => {
    return useQuery({
      queryKey: ['metrics', 'publications', publicationIds],
      queryFn: () => {
        if (!publicationIds?.length)
          throw new Error('Publication IDs are required');
        return calculatePublicationMetrics(publicationIds);
      },
      ...options,
      enabled: !!publicationIds?.length && (options as any).enabled !== false,
    });
  };

  const calculatePropertyMetricsByPlatform = useCallback(
    async (propertyIds: string[]) => {
      return api.post(`/metrics/properties-platform`, {
        ids: propertyIds,
      });
    },
    [api],
  );

  const usePropertyMetricsByPlatform = (
    propertyIds: string[] | null,
    options = {},
  ) => {
    return useQuery({
      queryKey: ['metrics', 'properties-platform', propertyIds],
      queryFn: () => {
        if (!propertyIds?.length) throw new Error('Property IDs are required');
        return calculatePropertyMetricsByPlatform(propertyIds);
      },
      ...options,
      enabled: !!propertyIds?.length && (options as any).enabled !== false,
    });
  };

  return useMemo(
    () => ({
      api,
      // Original API methods: Try to not use these directly, use the hooks instead
      publicationsApi: {
        publish: publishPublication,
        duplicate: duplicatePublication,
        delete: deletePublication,
        check: checkPublications,
        sendTestEmail: sendTestEmailPublication,
        unpublish: unpublishPublication,
      },
      propertiesApi: {
        syncPublications: syncPublicationsWithProperty,
        delete: deleteProperty,
        createPublicationDraft: createPublicationDraftFromProperty,
        sendTestEmail: sendTestEmailProperty,
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
      metricsApi: {
        calculatePublicationMetrics,
        calculatePropertyMetricsByPlatform,
      },
      // Tanstack Query hooks: Always use these if you don't know what you're doing
      useQueries: {
        useHealthCheck,
        useCheckPublications,
        useRecordMessageThreads,
        usePublicationMetrics,
        usePropertyMetricsByPlatform,
      },
      useMutations: {
        useSyncPublicationsWithProperty,
        useDeleteProperty,
        useCreatePublicationDraft,
        useCreateEmailWebhook,
        useCreateWorkspace,
        usePublishPublication,
        useDuplicatePublication,
        useDeletePublication,
        useUnpublishPublication,
        useSendTestEmailPublication,
        useSendTestEmailProperty,
      },
    }),
    [
      api,
      calculatePropertyMetricsByPlatform,
      calculatePublicationMetrics,
      checkHealth,
      checkPublications,
      createEmailWebhook,
      createPublicationDraftFromProperty,
      createWorkspace,
      deleteProperty,
      deletePublication,
      duplicatePublication,
      getRecordMessageThreads,
      publishPublication,
      sendTestEmailProperty,
      sendTestEmailPublication,
      syncPublicationsWithProperty,
      unpublishPublication,
      useHealthCheck,
      useCheckPublications,
      useRecordMessageThreads,
      usePublicationMetrics,
      usePropertyMetricsByPlatform,
      useSyncPublicationsWithProperty,
      useDeleteProperty,
      useCreatePublicationDraft,
      useCreateEmailWebhook,
      useCreateWorkspace,
      usePublishPublication,
      useDuplicatePublication,
      useDeletePublication,
      useUnpublishPublication,
      useSendTestEmailPublication,
      useSendTestEmailProperty,
    ],
  );
};

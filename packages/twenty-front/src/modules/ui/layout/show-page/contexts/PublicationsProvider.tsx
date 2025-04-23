import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import {
    PublicationGroupsType,
    usePublicationsOfProperty,
} from '@/ui/layout/show-page/hooks/usePublicationsOfProperty';
import { ReactNode, createContext, useContext, useMemo } from 'react';

type PublicationsContextValue = {
  publicationGroups: PublicationGroupsType;
  loading: boolean;
  refetch: () => Promise<any>;
  publications: any[];
  arePublicationsEqual: (pub1: any, pub2: any) => boolean;
  publicationGroupsWithoutAll: PublicationGroupsType;
};

const PublicationsContext = createContext<PublicationsContextValue | null>(
  null,
);

export const usePublications = (): PublicationsContextValue => {
  const context = useContext(PublicationsContext);

  if (!context) {
    throw new Error(
      'usePublications must be used within a PublicationsProvider',
    );
  }

  return context;
};

type PublicationsProviderProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  children: ReactNode;
};

export const PublicationsProvider = ({
  targetableObject,
  children,
}: PublicationsProviderProps) => {
  const {
    publicationGroups,
    loading,
    refetch,
    publications,
    arePublicationsEqual,
  } = usePublicationsOfProperty(targetableObject.id);

  const publicationGroupsWithoutAll = useMemo(() => {
    return Object.fromEntries(
      Object.entries(publicationGroups).filter(
        ([platform]) => platform !== 'all',
      ),
    );
  }, [publicationGroups]);

  const contextValue = useMemo(
    () => ({
      publicationGroups,
      loading,
      refetch,
      publications,
      arePublicationsEqual,
      publicationGroupsWithoutAll,
    }),
    [
      publicationGroups,
      loading,
      refetch,
      publications,
      publicationGroupsWithoutAll,
      arePublicationsEqual,
    ],
  );

  return (
    <PublicationsContext.Provider value={contextValue}>
      {children}
    </PublicationsContext.Provider>
  );
};

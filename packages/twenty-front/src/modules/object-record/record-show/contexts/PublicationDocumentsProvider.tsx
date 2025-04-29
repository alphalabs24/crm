import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePropertyDocuments } from '@/ui/layout/show-page/hooks/usePropertyDocuments';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

type PublicationDocumentsContextValue = {
  draftAllDocuments: any[];
  publishedAllDocuments: any[];
  draftDocumentsByType: Record<string, any[]>;
  publishedDocumentsByType: Record<string, any[]>;
  loading: boolean;
};

const PublicationDocumentsContext =
  createContext<PublicationDocumentsContextValue>({
    draftAllDocuments: [],
    publishedAllDocuments: [],
    draftDocumentsByType: {},
    publishedDocumentsByType: {},
    loading: false,
  });

export const usePublicationDocuments = () =>
  useContext(PublicationDocumentsContext);

type PublicationDocumentsProviderProps = {
  draftRecord?: ObjectRecord | null;
  publishedRecord?: ObjectRecord | null;
} & PropsWithChildren;

export const PublicationDocumentsProvider = ({
  draftRecord,
  publishedRecord,
  children,
}: PublicationDocumentsProviderProps) => {
  // Get documents for draft publication
  const {
    allDocuments: draftAllDocuments,
    documentsByType: draftDocumentsByType,
  } = usePropertyDocuments({
    id: draftRecord?.id ?? '',
    targetObjectNameSingular: CoreObjectNameSingular.Publication,
  });

  // Get documents for published publication
  const {
    allDocuments: publishedAllDocuments,
    documentsByType: publishedDocumentsByType,
  } = usePropertyDocuments({
    id: publishedRecord?.id ?? '',
    targetObjectNameSingular: CoreObjectNameSingular.Publication,
  });

  // Determine loading state from document counts
  const loading = useMemo(() => {
    // If we have records but no documents yet, we're probably still loading
    const isDraftLoading = draftRecord && draftAllDocuments.length === 0;
    const isPublishedLoading =
      publishedRecord && publishedAllDocuments.length === 0;

    return Boolean(isDraftLoading || isPublishedLoading);
  }, [draftRecord, publishedRecord, draftAllDocuments, publishedAllDocuments]);

  const contextValue = useMemo(
    () => ({
      draftAllDocuments: draftAllDocuments || [],
      publishedAllDocuments: publishedAllDocuments || [],
      draftDocumentsByType: draftDocumentsByType || {},
      publishedDocumentsByType: publishedDocumentsByType || {},
      loading,
    }),
    [
      draftAllDocuments,
      publishedAllDocuments,
      draftDocumentsByType,
      publishedDocumentsByType,
      loading,
    ],
  );

  return (
    <PublicationDocumentsContext.Provider value={contextValue}>
      {children}
    </PublicationDocumentsContext.Provider>
  );
};

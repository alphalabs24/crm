import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

type PublicationImagesContextValue = {
  draftImages: any[];
  publishedImages: any[];
  loading: boolean;
};

const PublicationImagesContext = createContext<PublicationImagesContextValue>({
  draftImages: [],
  publishedImages: [],
  loading: false,
});

export const usePublicationImages = () => useContext(PublicationImagesContext);

type PublicationImagesProviderProps = {
  draftRecord?: ObjectRecord | null;
  publishedRecord?: ObjectRecord | null;
} & PropsWithChildren;

export const PublicationImagesProvider = ({
  draftRecord,
  publishedRecord,
  children,
}: PublicationImagesProviderProps) => {
  // Get loading state from the useAttachments hook
  const { loading: loadingDraftAttachments } = useAttachments({
    id: draftRecord?.id ?? '',
    targetObjectNameSingular: CoreObjectNameSingular.Publication,
  });

  const { loading: loadingPublishedAttachments } = useAttachments({
    id: publishedRecord?.id ?? '',
    targetObjectNameSingular: CoreObjectNameSingular.Publication,
  });

  // Get images for both draft and published
  const draftImages = usePropertyImages({
    id: draftRecord?.id ?? '',
    targetObjectNameSingular: CoreObjectNameSingular.Publication,
  });

  const publishedImages = usePropertyImages({
    id: publishedRecord?.id ?? '',
    targetObjectNameSingular: CoreObjectNameSingular.Publication,
  });

  const contextValue = useMemo(
    () => ({
      draftImages: draftImages || [],
      publishedImages: publishedImages || [],
      loading: loadingDraftAttachments || loadingPublishedAttachments,
    }),
    [
      draftImages,
      publishedImages,
      loadingDraftAttachments,
      loadingPublishedAttachments,
    ],
  );

  return (
    <PublicationImagesContext.Provider value={contextValue}>
      {children}
    </PublicationImagesContext.Provider>
  );
};

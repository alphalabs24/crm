import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useSyncDrafts } from './useSyncDrafts';
import { useState } from 'react';

export const useSyncAndPublish = ({
  targetableObject,

  onSuccess,
  publications,
}: {
  targetableObject: ActivityTargetableObject;
  onSuccess?: () => void;
  publications: ObjectRecord[];
}) => {
  const { useMutations } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [publishedPublications, setPublishedPublications] = useState<number>(0);

  const { mutate: publishPublication, isPending: isPublishPending } =
    useMutations.usePublishPublication({
      onSuccess: async () => {
        setPublishedPublications((prev) => prev + 1);
        if (publishedPublications === publications.length - 1) {
          onSuccess?.();
          setPublishedPublications(0);
        }
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || t`Failed to publish publications`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const { syncPublicationDrafts: syncDrafts, loading: syncLoading } =
    useSyncDrafts({
      targetableObject,
      publications,
      onSuccess: () => {
        // Add a delay to ensure backend processing completes before publishing
        setTimeout(() => {
          // Process publications one at a time with a small delay between each
          publications.forEach((publication, index) => {
            setTimeout(() => {
              publishPublication({ publicationId: publication.id });
            }, index * 500); // 500ms delay between each publication
          });
        }, 1000); // 1 second delay after sync is complete
      },
    });

  const syncAndPublish = () => {
    syncDrafts();
  };

  return {
    syncAndPublish,
    loading: syncLoading || isPublishPending,
  };
};

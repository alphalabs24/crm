import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

export const useSyncAndPublish = ({
  targetableObject,
  onSuccess,
}: {
  targetableObject: ActivityTargetableObject;
  onSuccess?: () => void;
}) => {
  const { useMutations } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);

  // Use the new sync-and-publish endpoint directly
  const { mutate: syncAndPublishMutation, isPending } =
    useMutations.useSyncAndPublishPublications(targetableObject.id, {
      onSuccess: () => {
        enqueueSnackBar(
          t`Your publications were synced and published successfully`,
          {
            variant: SnackBarVariant.Success,
          },
        );
        onSuccess?.();
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || t`Failed to sync and publish`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  // Simplified function that just calls the mutation
  const syncAndPublish = () => {
    setIsLoading(true);
    syncAndPublishMutation();
  };

  return {
    syncAndPublish,
    loading: isLoading || isPending,
  };
};

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';

export const useSyncDrafts = ({
  targetableObject,
  refetchPublications,
  onSuccess,
}: {
  targetableObject: ActivityTargetableObject;
  refetchPublications?: () => void;
  onSuccess?: () => void;
}) => {
  const { useMutations } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { mutate: syncPublicationMutation, isPending: isSyncPending } =
    useMutations.useSyncPublicationsWithProperty(targetableObject.id, {
      onSuccess: async () => {
        enqueueSnackBar(t`Your Publication Drafts were synced successfully`, {
          variant: SnackBarVariant.Success,
        });
        onSuccess?.();
        refetchPublications?.();
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || t`Failed to sync publications`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const syncPublicationDrafts = useCallback(async () => {
    await syncPublicationMutation();
  }, [syncPublicationMutation]);

  return {
    syncPublicationDrafts,
    loading: isSyncPending,
  };
};

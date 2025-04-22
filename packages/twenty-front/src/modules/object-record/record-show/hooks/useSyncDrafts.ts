import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useSyncDrafts = ({
  targetableObject,
  refetchPublications,
  onSuccess,
  publications,
}: {
  targetableObject: ActivityTargetableObject;
  refetchPublications?: () => void;
  onSuccess?: () => void;
  publications: ObjectRecord[];
}) => {
  const { useMutations } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();
  const [duplicationsCompleted, setDuplicationsCompleted] = useState(0);
  const [duplicationsTotal, setDuplicationsTotal] = useState(0);

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

  const {
    mutate: duplicatePublicationMutation,
    isPending: isDuplicatePending,
  } = useMutations.useDuplicatePublication({
    onSuccess: async () => {
      // On Success we increment the counter
      setDuplicationsCompleted((prev) => prev + 1);
      // If we have completed all duplications, we sync the drafts
      if (duplicationsCompleted === duplicationsTotal - 1) {
        await syncPublicationMutation();
        setDuplicationsCompleted(0);
        setDuplicationsTotal(0);
      }
    },
    onError: (error: Error) => {
      enqueueSnackBar(error?.message || t`Failed to sync publications`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  // cleanup in case we have a race condition. This is only a failsafe.
  useEffect(() => {
    if (duplicationsCompleted === duplicationsTotal && duplicationsTotal > 0) {
      syncPublicationMutation();
      setDuplicationsCompleted(0);
      setDuplicationsTotal(0);
      onSuccess?.();
    }
  }, [
    duplicationsCompleted,
    duplicationsTotal,
    syncPublicationMutation,
    onSuccess,
  ]);

  const syncPublicationDrafts = useCallback(async () => {
    setDuplicationsTotal(publications.length);
    // create drafts for all platforms that are published if they don't have one yet
    for (const publication of publications) {
      // First we duplicate all publications to create drafts
      await duplicatePublicationMutation({ publicationId: publication.id });
    }
  }, [publications, duplicatePublicationMutation]);

  const loading = useMemo(() => {
    return isSyncPending || isDuplicatePending;
  }, [isSyncPending, isDuplicatePending]);

  return {
    syncPublicationDrafts,
    loading,
  };
};

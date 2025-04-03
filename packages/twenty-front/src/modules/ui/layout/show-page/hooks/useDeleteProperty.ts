import { useNestermind } from '@/api/hooks/useNestermind';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';

type Props = {
  objectRecordId: string;
  onDelete?: () => Promise<void>;
};

// Handles the deletion of a property and all its publications through the API. Make sure
// to refetch the data after the deletion!
export const useDeleteProperty = ({ objectRecordId, onDelete }: Props) => {
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const { useMutations } = useNestermind();

  // Use mutation hooks instead of direct API calls
  const { mutate: deletePropertyMutation, isPending: isDeletePropertyPending } =
    useMutations.useDeleteProperty(objectRecordId, {
      onSuccess: async () => {
        // Call the onDelete callback to handle any additional logic
        await onDelete?.();
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || t`Failed to delete property`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const {
    mutate: deletePublicationMutation,
    isPending: isDeletePublicationPending,
  } = useMutations.useDeletePublication({
    onSuccess: async () => {
      // Call the onDelete callback to handle any additional logic
      await onDelete?.();
    },
    onError: (error: Error) => {
      enqueueSnackBar(error?.message || t`Failed to delete publication`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const deletePropertyAndAllPublications = useCallback(() => {
    deletePropertyMutation();
  }, [deletePropertyMutation]);

  const deletePublication = useCallback(() => {
    deletePublicationMutation({
      publicationId: objectRecordId,
    });
  }, [deletePublicationMutation, objectRecordId]);

  return {
    deletePropertyAndAllPublications,
    deletePublication,
    loading: isDeletePropertyPending || isDeletePublicationPending,
  };
};

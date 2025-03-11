import { tokenPairState } from '@/auth/states/tokenPairState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { getEnv } from '~/utils/get-env';

type Props = {
  objectRecordId: string;
  onDelete?: () => Promise<void>;
};

// Handles the deletion of a property and all its publications through the API. Make sure
// to refetch the data after the deletion!
export const useDeleteProperty = ({ objectRecordId, onDelete }: Props) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackBar } = useSnackBar();
  const tokenPair = useRecoilValue(tokenPairState);

  const deletePropertyAndAllPublications = useCallback(async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${getEnv('REACT_APP_NESTERMIND_SERVER_BASE_URL') ?? 'http://api.localhost'}/properties/delete?id=${objectRecordId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );

      // Call the onDelete callback to handle any additional logic
      await onDelete?.();
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setLoading(false);
    }
  }, [
    enqueueSnackBar,
    objectRecordId,
    onDelete,
    tokenPair?.accessToken?.token,
  ]);

  const deletePublication = useCallback(async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${getEnv('REACT_APP_NESTERMIND_SERVER_BASE_URL') ?? 'http://api.localhost'}/publications/delete?id=${objectRecordId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );

      // Call the onDelete callback to handle any additional logic
      await onDelete?.();
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setLoading(false);
    }
  }, [
    enqueueSnackBar,
    objectRecordId,
    onDelete,
    tokenPair?.accessToken?.token,
  ]);

  return {
    deletePropertyAndAllPublications,
    deletePublication,
    loading,
  };
};

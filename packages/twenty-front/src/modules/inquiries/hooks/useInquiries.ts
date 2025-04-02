import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useEffect, useMemo } from 'react';
import { useNestermind } from '@/api/hooks/useNestermind';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseInquiriesOptions = {
  publicationId?: string;
  propertyId?: string;
};

export const useInquiries = ({
  publicationId,
  propertyId,
}: UseInquiriesOptions = {}) => {
  const {
    useQueries: { useBuyerLeadMessageThreads },
  } = useNestermind();

  const { enqueueSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.BuyerLead,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const filterVariables = useMemo(() => {
    const filters: Record<string, any> = {};
    if (publicationId) {
      filters.publicationId = { eq: publicationId };
    }
    if (propertyId) {
      filters.propertyId = { eq: propertyId };
    }
    return filters;
  }, [publicationId, propertyId]);

  const { records, loading, fetchMoreRecords, totalCount } = useFindManyRecords(
    {
      objectNameSingular: CoreObjectNameSingular.BuyerLead,
      recordGqlFields,
      skip: !objectMetadataItem,
      filter: filterVariables,
    },
  );

  // Fetch the message threads for inquiries
  const {
    data: messageThreadsByInquiryId,
    isLoading: isLoadingMessageThreads,
    error: messageThreadsError,
  } = useBuyerLeadMessageThreads(
    records.map((record) => record.id),
    { enabled: !!records.length },
  );

  const inquiriesWithMessageThreads = useMemo(() => {
    return (
      records.map((record) => {
        return {
          ...record,
          messageThreads: messageThreadsByInquiryId?.[record.id] ?? [],
        };
      }) as ObjectRecord[]
    ).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) as ObjectRecord[];
  }, [records, messageThreadsByInquiryId]);

  useEffect(() => {
    if (messageThreadsError) {
      enqueueSnackBar('Error fetching messages', {
        variant: SnackBarVariant.Error,
      });
    }
  }, [messageThreadsError, enqueueSnackBar]);

  return {
    records: inquiriesWithMessageThreads,
    loading: loading || isLoadingMessageThreads,
    fetchMoreRecords,
    totalCount,
  };
};

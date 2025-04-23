import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInquiryReadState } from './useInquiryReadState';
import { usePollingInterval } from './usePollingInterval';

const INQUIRIES_POLLING_INTERVAL = 30000; // 30 seconds

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
  const { hasNewMessages, markAsUnread, isUnread } = useInquiryReadState();
  const processedInquiriesRef = useRef<Set<string>>(new Set());

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.BuyerLead,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
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

  const { records, loading, fetchMoreRecords, totalCount, refetch } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.BuyerLead,
      recordGqlFields,
      skip: !objectMetadataItem,
      filter: filterVariables,
    });

  // Set up polling for inquiries list
  const pollInquiries = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error polling inquiries:', error);
    }
  }, [refetch]);

  usePollingInterval(pollInquiries, INQUIRIES_POLLING_INTERVAL);

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
      (
        records.map((record) => {
          return {
            ...record,
            messageThreads: messageThreadsByInquiryId?.[record.id] ?? [],
          };
        }) as ObjectRecord[]
      )
        // Filter out inquiries without message threads
        .filter(
          (inquiry) =>
            inquiry.messageThreads && inquiry.messageThreads.length > 0,
        )
        .sort((a, b) => {
          // Sort in descending order (newest first)
          const timeA = new Date(
            a.messageThreads[0]?.lastMessageReceivedAt || 0,
          ).getTime();
          const timeB = new Date(
            b.messageThreads[0]?.lastMessageReceivedAt || 0,
          ).getTime();

          // Return positive number if B is newer than A (B should come first)
          return timeB - timeA;
        }) as ObjectRecord[]
    );
  }, [records, messageThreadsByInquiryId]);

  // Check for new messages and update read state
  useEffect(() => {
    if (!inquiriesWithMessageThreads.length || isLoadingMessageThreads) {
      return;
    }

    let newlyMarkedAsUnread = false;

    // Check each inquiry for new messages
    inquiriesWithMessageThreads.forEach((inquiry) => {
      // Skip if we've already processed this inquiry in this session
      if (processedInquiriesRef.current.has(inquiry.id)) {
        return;
      }

      // Only mark as unread and show notification if:
      // 1. It has new messages
      // 2. It's not already marked as unread
      if (hasNewMessages(inquiry) && !isUnread(inquiry)) {
        markAsUnread(inquiry.id);
        newlyMarkedAsUnread = true;
      }

      // Mark as processed
      processedInquiriesRef.current.add(inquiry.id);
    });

    // Only show notification if we actually marked something as unread
    if (newlyMarkedAsUnread) {
      enqueueSnackBar('New messages received', {
        variant: SnackBarVariant.Info,
      });
    }
  }, [
    inquiriesWithMessageThreads,
    isLoadingMessageThreads,
    hasNewMessages,
    isUnread,
    markAsUnread,
    enqueueSnackBar,
  ]);

  useEffect(() => {
    if (messageThreadsError) {
      console.log('messageThreadsError', messageThreadsError);
    }
  }, [messageThreadsError, enqueueSnackBar]);

  // Reset processed inquiries when filter changes
  useEffect(() => {
    processedInquiriesRef.current.clear();
  }, [publicationId, propertyId]);

  return {
    records: inquiriesWithMessageThreads,
    loading: loading || isLoadingMessageThreads,
    fetchMoreRecords,
    totalCount,
    deleteOne: deleteOneRecord,
    error: messageThreadsError,
  };
};

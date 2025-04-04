import { usePrevious } from '@/hooks/local-state/usePrevious';
import { useThreadMessages } from '@/inquiries/hooks/useThreadMessages';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

type InquiryPageContextProviderProps = {
  inquiries: ObjectRecord[];
  loading: boolean;
  deleteOne: (id: string) => void;
} & PropsWithChildren;

type InquiryContextValue = {
  selectedInquiryId: string | null;
  isInquirySidebarOpen: boolean;
  openInquirySidebar: (inquiryId: string) => void;
  closeInquirySidebar: () => void;
  toggleInquirySidebar: (inquiryId: string) => void;
  messages: ObjectRecord[];
  thread?: ObjectRecord;
  isLoadingMessages: boolean;
  selectedInquiry: any | null;
  setSelectedInquiry: (inquiry: any) => void;
  refreshMessages: () => void;
} & InquiryPageContextProviderProps;

const InquiryPageContext = createContext<InquiryContextValue | null>(null);

export const InquiryPageContextProvider = ({
  children,
  inquiries,
  loading,
  deleteOne,
}: InquiryPageContextProviderProps) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null,
  );

  // This way we know when the inquiry changes
  const selectedInquiry = useMemo(() => {
    return inquiries.find((inquiry) => inquiry.id === selectedInquiryId);
  }, [inquiries, selectedInquiryId]);

  const [isInquirySidebarOpen, setIsInquirySidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { messages, thread, threadLoading, messageChannelLoading, refetch } =
    useThreadMessages(selectedInquiry?.messageThreads[0]?.id ?? '');

  const currentThreadTimestamp = useMemo(
    () => selectedInquiry?.messageThreads[0]?.lastMessageReceivedAt,
    [selectedInquiry],
  );

  // Track the last message timestamp to detect changes
  const lastMessageTimestampRef = usePrevious(currentThreadTimestamp);

  // Refresh messages when new messages are detected in the thread
  useEffect(() => {
    // If this is a different timestamp than what we last saw, we need to refetch messages
    if (
      currentThreadTimestamp &&
      lastMessageTimestampRef &&
      currentThreadTimestamp !== lastMessageTimestampRef
    ) {
      refetch();
    }
  }, [currentThreadTimestamp, lastMessageTimestampRef, refetch]);

  const openInquirySidebar = useCallback(() => {
    setIsInquirySidebarOpen(true);
  }, []);

  const closeInquirySidebar = useCallback(() => {
    setSelectedInquiryId(null);
    setIsInquirySidebarOpen(false);
    if (searchParams.get('id')) {
      // remove id from search params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('id');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const toggleInquirySidebar = useCallback(
    (inquiryId: string) => {
      if (selectedInquiry?.id === inquiryId && isInquirySidebarOpen) {
        closeInquirySidebar();
      } else {
        openInquirySidebar();
      }
    },
    [
      selectedInquiry?.id,
      isInquirySidebarOpen,
      openInquirySidebar,
      closeInquirySidebar,
    ],
  );

  const refreshMessages = useCallback(() => {
    if (selectedInquiry) {
      // Force a re-fetch by updating the selectedInquiry
      refetch();
    }
  }, [selectedInquiry, refetch]);

  const contextValue: InquiryContextValue = {
    selectedInquiryId,
    isInquirySidebarOpen,
    openInquirySidebar,
    closeInquirySidebar,
    toggleInquirySidebar,
    messages,
    thread,
    selectedInquiry,
    setSelectedInquiry: setSelectedInquiryId,
    refreshMessages,
    isLoadingMessages: threadLoading || messageChannelLoading,
    inquiries,
    loading,
    deleteOne,
  };

  return (
    <InquiryPageContext.Provider value={contextValue}>
      {children}
    </InquiryPageContext.Provider>
  );
};

export const useInquiryPage = () => {
  const context = useContext(InquiryPageContext);

  if (!context) {
    throw new Error(
      'useInquiryPage must be used within InquiryPageContextProvider',
    );
  }

  return context;
};

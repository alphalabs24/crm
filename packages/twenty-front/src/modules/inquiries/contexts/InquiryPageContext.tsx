import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react';
import { TimelineThread } from '~/generated/graphql';

// Define message type that extends TimelineThread
type Message = {
  id: string;
  text: string;
  receivedAt?: string;
  createdAt: string;
  author?: {
    displayName?: string;
  };
};

// Define extended thread type with messages
export type ThreadWithMessages = TimelineThread & {
  messages: Message[];
};

type InquiryContextValue = {
  selectedInquiryId: string | null;
  isInquirySidebarOpen: boolean;
  openInquirySidebar: (inquiryId: string) => void;
  closeInquirySidebar: () => void;
  toggleInquirySidebar: (inquiryId: string) => void;
  messageThreads: ThreadWithMessages[] | null;
  isLoadingMessageThreads: boolean;
  selectedInquiry: any | null;
  setSelectedInquiry: (inquiry: any) => void;
  refreshMessageThreads: () => void;
};

const InquiryPageContext = createContext<InquiryContextValue | undefined>(
  undefined,
);

export const InquiryPageContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    useQueries: { useRecordMessageThreads },
  } = useNestermind();
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null,
  );
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [isInquirySidebarOpen, setIsInquirySidebarOpen] = useState(false);

  // Fetch the message threads for the selected inquiry
  const {
    data: messageThreads,
    isLoading: isLoadingMessageThreads,
    refetch: refreshMessageThreads,
    error: messageThreadsError,
  } = useRecordMessageThreads(
    selectedInquiryId,
    CoreObjectNameSingular.BuyerLead,
    { enabled: !!selectedInquiryId },
  );

  const openInquirySidebar = useCallback((inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setIsInquirySidebarOpen(true);
  }, []);

  const closeInquirySidebar = useCallback(() => {
    setIsInquirySidebarOpen(false);
  }, []);

  const toggleInquirySidebar = useCallback(
    (inquiryId: string) => {
      if (selectedInquiryId === inquiryId && isInquirySidebarOpen) {
        closeInquirySidebar();
      } else {
        openInquirySidebar(inquiryId);
      }
    },
    [
      selectedInquiryId,
      isInquirySidebarOpen,
      openInquirySidebar,
      closeInquirySidebar,
    ],
  );

  const contextValue = {
    selectedInquiryId,
    isInquirySidebarOpen,
    openInquirySidebar,
    closeInquirySidebar,
    toggleInquirySidebar,
    messageThreads: messageThreads || null,
    messageThreadsError,
    isLoadingMessageThreads,
    selectedInquiry,
    setSelectedInquiry,
    refreshMessageThreads,
  };

  return (
    <InquiryPageContext.Provider value={contextValue}>
      {children}
    </InquiryPageContext.Provider>
  );
};

export const useInquiryPage = (): InquiryContextValue => {
  const context = useContext(InquiryPageContext);

  if (context === undefined) {
    throw new Error(
      'useInquiryPage must be used within an InquiryPageContextProvider',
    );
  }

  return context;
};

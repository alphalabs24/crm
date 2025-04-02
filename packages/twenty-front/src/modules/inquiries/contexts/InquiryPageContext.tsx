import { useThreadMessages } from '@/inquiries/hooks/useThreadMessages';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

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
};

const InquiryPageContext = createContext<InquiryContextValue | undefined>(
  undefined,
);

export const InquiryPageContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [isInquirySidebarOpen, setIsInquirySidebarOpen] = useState(false);

  const { messages, thread, threadLoading, messageChannelLoading } =
    useThreadMessages(selectedInquiry?.messageThreads[0]?.id);

  const openInquirySidebar = useCallback(() => {
    setIsInquirySidebarOpen(true);
  }, []);

  const closeInquirySidebar = useCallback(() => {
    setIsInquirySidebarOpen(false);
  }, []);

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

  const contextValue = {
    selectedInquiryId: selectedInquiry?.id,
    isInquirySidebarOpen,
    openInquirySidebar,
    closeInquirySidebar,
    toggleInquirySidebar,
    messages,
    thread,
    selectedInquiry,
    setSelectedInquiry,
    refreshMessages: () => {},
    isLoadingMessages: threadLoading || messageChannelLoading,
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

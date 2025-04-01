import { InquiriesList } from '@/inquiries/components/InquiriesList';
import { InquirySidebar } from '@/inquiries/components/InquirySidebar';
import {
  InquiryPageContextProvider,
  useInquiryPage,
} from '@/inquiries/contexts/InquiryPageContext';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
import { IconInbox, LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledSplitView = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledLeftPanel = styled.div<{ isSidebarOpen: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  width: 100%;
  flex-shrink: 0;
  transition: width 0.3s ease-in-out;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT + 1}px) {
    width: ${({ isSidebarOpen }) => (isSidebarOpen ? '400px' : '100%')};
  }
`;

const StyledPageContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const RecordInquiriesPageContent = () => {
  const { isInquirySidebarOpen } = useInquiryPage();

  return (
    <StyledSplitView>
      <StyledLeftPanel isSidebarOpen={isInquirySidebarOpen}>
        <StyledPageContainer>
          <PageHeader title="Inquiries" Icon={IconInbox} />
          <InquiriesList />
        </StyledPageContainer>
      </StyledLeftPanel>
      <InquirySidebar />
    </StyledSplitView>
  );
};

export const RecordInquiriesPage = () => {
  return (
    <InquiryPageContextProvider>
      <RecordInquiriesPageContent />
    </InquiryPageContextProvider>
  );
};

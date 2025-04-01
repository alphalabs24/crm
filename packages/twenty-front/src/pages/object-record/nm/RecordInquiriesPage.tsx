import { InquiriesList } from '@/inquiries/components/InquiriesList';
import { InquirySidebar } from '@/inquiries/components/InquirySidebar';
import { InquiryPageContextProvider } from '@/inquiries/contexts/InquiryPageContext';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
import { IconInbox } from 'twenty-ui';

const StyledSplitView = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
`;

const StyledLeftPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0; /* Important for text truncation in children */
  overflow: hidden;
`;

export const RecordInquiriesPage = () => {
  return (
    <InquiryPageContextProvider>
      <StyledSplitView>
        <StyledLeftPanel>
          <PageContainer>
            <PageHeader title="Inquiries" Icon={IconInbox} />
            <InquiriesList />
          </PageContainer>
        </StyledLeftPanel>
        <InquirySidebar />
      </StyledSplitView>
    </InquiryPageContextProvider>
  );
};

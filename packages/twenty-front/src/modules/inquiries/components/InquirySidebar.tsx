import { useInquiryPage } from '@/inquiries/contexts/InquiryPageContext';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  useIsMobile,
} from 'twenty-ui';
import { ConversationSection } from './sidebar/ConversationSection';
import { PropertyDetails } from './sidebar/PropertyDetails';

const StyledSidebar = styled.div<{ isOpen: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: ${({ isOpen }) => (isOpen ? '100%' : '0')};

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT + 1}px) {
    position: absolute;
    width: ${({ isOpen }) => (isOpen ? 'calc(100% - 400px)' : '0')};
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  width: 100%;
  // Account for mobile bottom bar
  margin-bottom: ${({ theme }) => theme.spacing(12)};

  @media (min-width: ${MOBILE_VIEWPORT + 1}px) {
    margin-bottom: 0;
  }
`;

const StyledConversationWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

export const InquirySidebar = () => {
  const { isInquirySidebarOpen, closeInquirySidebar, selectedInquiry } =
    useInquiryPage();

  const isMobile = useIsMobile();

  const [isPropertyDetailsExpanded, setIsPropertyDetailsExpanded] =
    useState(false);

  // Only show content if there's a selected inquiry
  const hasInquiry = Boolean(selectedInquiry);

  return (
    <>
      <StyledSidebar isOpen={isInquirySidebarOpen}>
        {hasInquiry && (
          <StyledContent>
            <StyledConversationWrapper>
              <ConversationSection
                inquiry={selectedInquiry}
                onClose={closeInquirySidebar}
                onExpandProperty={() => setIsPropertyDetailsExpanded(true)}
                isPropertyDetailsExpanded={isPropertyDetailsExpanded}
              />
            </StyledConversationWrapper>
            {isPropertyDetailsExpanded && !isMobile && (
              <PropertyDetails
                property={selectedInquiry.property}
                onCollapse={() => setIsPropertyDetailsExpanded(false)}
              />
            )}
          </StyledContent>
        )}
      </StyledSidebar>
    </>
  );
};

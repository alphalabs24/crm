import { useInquiryPage } from '@/inquiries/contexts/InquiryPageContext';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { getImageAbsoluteURI } from 'twenty-shared';
import { Button, IconChevronLeft, IconUser, IconX } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { formatAmount } from '~/utils/format/formatAmount';

// Define message type to avoid type errors
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
type ThreadWithMessages = {
  id: string;
  messages: Message[];
} & Record<string, any>;

// Sidebar layout components
const StyledSidebar = styled.div<{ isOpen: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: width 0.3s ease-in-out;
  width: ${({ isOpen }) => (isOpen ? '500px' : '0')};
`;

const StyledSidebarContent = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
`;

const StyledSidebarLeft = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 450px;
  overflow: hidden;
`;

const StyledSidebarRight = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledProfileSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledProfilePicture = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 50%;
  display: flex;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;
`;

const StyledProfileImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPlatform = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

// Message thread section
const StyledMessageSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledMessageList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledMessageItem = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledMessageHeader = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledMessageContent = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledNoMessages = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  text-align: center;
`;

const StyledMessageIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  display: flex;
  height: 48px;
  justify-content: center;
  width: 48px;
`;

const StyledLoading = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

// Property section
const StyledTabContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledPropertySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPropertyHeader = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

const StyledPropertyTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledPropertyAddress = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledPropertyPrice = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDetailLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledDetailValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledDescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescriptionHeader = styled.h4`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledTabs = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ theme, isActive }) => (isActive ? theme.color.blue : 'transparent')};
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2)};
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

export const InquirySidebar = () => {
  const theme = useTheme();
  const {
    isInquirySidebarOpen,
    closeInquirySidebar,
    messageThreads,
    isLoadingMessageThreads,
    selectedInquiry,
  } = useInquiryPage();

  const [activeTab, setActiveTab] = useState('property');

  // Format property price for display
  const formattedPrice = useMemo(() => {
    if (!selectedInquiry?.property) return null;
    const property = selectedInquiry.property;

    const rent = property.rentNet;
    const price = property.sellingPrice;

    if (rent?.amountMicros) {
      return `${formatAmount(rent.amountMicros / 1000000)} ${rent.currencyCode}`;
    }
    if (price?.amountMicros) {
      return `${formatAmount(price.amountMicros / 1000000)} ${price.currencyCode}`;
    }
    return null;
  }, [selectedInquiry?.property]);

  // Format property address
  const formattedAddress = useMemo(() => {
    if (!selectedInquiry?.property?.address) return '';
    const address = selectedInquiry.property.address;

    return [
      address.addressStreet1,
      address.addressCity,
      address.addressPostcode,
    ]
      .filter(Boolean)
      .join(', ');
  }, [selectedInquiry?.property?.address]);

  // Cast messageThreads to the extended type that includes messages
  const threadsWithMessages = useMemo(() => {
    return messageThreads as ThreadWithMessages[] | null;
  }, [messageThreads]);

  // Only show content if there's a selected inquiry
  const hasInquiry = Boolean(selectedInquiry);

  return (
    <StyledSidebar isOpen={isInquirySidebarOpen}>
      {hasInquiry && (
        <>
          <StyledHeader>
            <StyledProfileSection>
              <Button
                Icon={IconChevronLeft}
                variant="tertiary"
                onClick={closeInquirySidebar}
              />
              <StyledProfilePicture>
                {selectedInquiry.person?.avatarUrl ? (
                  <StyledProfileImage
                    src={getImageAbsoluteURI({
                      imageUrl: selectedInquiry.person.avatarUrl,
                      baseUrl: REACT_APP_SERVER_BASE_URL,
                    })}
                    alt={`${selectedInquiry.person.name.firstName} ${selectedInquiry.person.name.lastName}`}
                  />
                ) : (
                  <IconUser size={24} color={theme.font.color.light} />
                )}
              </StyledProfilePicture>
              <StyledProfileInfo>
                <StyledName>
                  {selectedInquiry.person.name.firstName}{' '}
                  {selectedInquiry.person.name.lastName}
                </StyledName>
                {selectedInquiry.publication?.platform && (
                  <StyledPlatform>
                    <span>Inquiry from</span>
                    <PlatformBadge
                      platformId={selectedInquiry.publication.platform}
                      size="small"
                      variant="no-background"
                    />
                  </StyledPlatform>
                )}
              </StyledProfileInfo>
            </StyledProfileSection>
            <Button
              Icon={IconX}
              variant="tertiary"
              onClick={closeInquirySidebar}
            />
          </StyledHeader>
          <StyledSidebarContent></StyledSidebarContent>
        </>
      )}
    </StyledSidebar>
  );
};

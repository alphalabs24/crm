import { useInquiryPage } from '@/inquiries/contexts/InquiryPageContext';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { getImageAbsoluteURI } from 'twenty-shared';
import {
  Button,
  IconChevronLeft,
  IconUser,
  IconX,
  LARGE_DESKTOP_VIEWPORT,
} from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { formatAmount } from '~/utils/format/formatAmount';

// Sidebar layout components
const StyledSidebar = styled.div<{ isOpen: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: ${({ isOpen }) => (isOpen ? '100%' : '0')};
  position: absolute;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT + 1}px) {
    width: ${({ isOpen }) => (isOpen ? 'calc(100% - 400px)' : '0')};
  }
`;

const StyledSidebarContent = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
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

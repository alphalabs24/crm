import { useInquiryPage } from '@/inquiries/contexts/InquiryPageContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { format } from 'date-fns';
import { getImageAbsoluteURI } from 'twenty-shared';
import { IconMessage, IconUser } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledInquiryItem = styled.div<{ isLast: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ isLast, theme }) =>
    isLast ? 'none' : `1px solid ${theme.border.color.light}`};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(4, 1)};
  position: relative;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledProfileSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledRelationshipSection = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

type InquiryItemProps = {
  id: string;
  inquiry: ObjectRecord;
  isLast?: boolean;
};

export const InquiryItem = ({
  id,
  inquiry,
  isLast = false,
}: InquiryItemProps) => {
  const theme = useTheme();
  const { createdAt, person, publication } = inquiry;
  const { openInquirySidebar, setSelectedInquiry } = useInquiryPage();
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');

  const avatarImageURI = isNonEmptyString(person.avatarUrl)
    ? getImageAbsoluteURI({
        imageUrl: person.avatarUrl,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  const handleInquiryClick = () => {
    setSelectedInquiry(inquiry);
    openInquirySidebar(id);
  };

  return (
    <StyledInquiryItem onClick={handleInquiryClick} isLast={isLast}>
      <StyledHeader>
        <StyledProfileSection>
          <StyledProfilePicture>
            {avatarImageURI ? (
              <StyledProfileImage
                src={avatarImageURI}
                alt={`${person.name.firstName} ${person.name.lastName}`}
              />
            ) : (
              <IconUser size={24} color={theme.font.color.light} />
            )}
          </StyledProfilePicture>
          <StyledName>
            {person.name.firstName} {person.name.lastName}
          </StyledName>
        </StyledProfileSection>
        <StyledDate>{formattedDate}</StyledDate>
      </StyledHeader>

      <StyledRelationshipSection>
        <IconMessage size={14} />
        <span>Inquiry for</span>
        <RecordChip
          objectNameSingular={CoreObjectNameSingular.Publication}
          record={publication}
          LeftCustomComponent={
            <PlatformBadge
              platformId={publication.platform}
              size="small"
              variant="no-background"
            />
          }
        />
      </StyledRelationshipSection>
    </StyledInquiryItem>
  );
};

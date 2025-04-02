import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { Avatar } from 'twenty-ui';

const StyledInquiryItem = styled.div<{ isLast: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ isLast, theme }) =>
    isLast ? 'none' : `1px solid ${theme.border.color.light}`};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  position: relative;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledProfileSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
`;

const StyledContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
  min-width: 0;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPreviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledMessagePreview = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  flex-shrink: 0;
`;

const StyledRelationshipSection = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
`;

type InquiryItemProps = {
  inquiry: ObjectRecord;
  isLast?: boolean;
  onClick?: () => void;
};

export const InquiryItem = ({
  onClick,
  inquiry,
  isLast = false,
}: InquiryItemProps) => {
  const { createdAt, person, publication } = inquiry;
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');

  const fullName = `${person.name.firstName} ${person.name.lastName}`;

  return (
    <StyledInquiryItem onClick={onClick} isLast={isLast}>
      <StyledHeader>
        <StyledProfileSection>
          <Avatar
            avatarUrl={person.avatarUrl}
            placeholder={fullName}
            size="xl"
            type="rounded"
          />
          <StyledContentSection>
            <StyledPreviewRow>
              <StyledName>{fullName}</StyledName>
              <StyledDate>{formattedDate}</StyledDate>
            </StyledPreviewRow>
            <StyledPreviewRow>
              {inquiry.messageParticipations && (
                <StyledMessagePreview>
                  {inquiry.messageParticipations.lastBodyMessage}
                </StyledMessagePreview>
              )}
              <StyledRelationshipSection>
                <PlatformBadge platformId={publication.platform} size="small" />
              </StyledRelationshipSection>
            </StyledPreviewRow>
          </StyledContentSection>
        </StyledProfileSection>
      </StyledHeader>
    </StyledInquiryItem>
  );
};

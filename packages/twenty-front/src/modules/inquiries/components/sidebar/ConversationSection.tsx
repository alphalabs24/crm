import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  Avatar,
  Button,
  IconChevronLeft,
  IconMessage,
  IconUser,
  IconX,
} from 'twenty-ui';
import { getImageAbsoluteURI } from 'twenty-shared';
import { format } from 'date-fns';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ReplyEditor } from './ReplyEditor';
import { useInquiryPage } from '../../contexts/InquiryPageContext';

const StyledConversationSection = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 42px;
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
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
`;

// Message thread styles
const StyledThreadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledThreadHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledThreadSubject = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledMessageContainer = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 90%;
  ${({ isCurrentUser }) => (isCurrentUser ? 'align-self: flex-end;' : '')}
`;

const StyledMessageHeader = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  ${({ isCurrentUser }) =>
    isCurrentUser ? 'flex-direction: row-reverse;' : ''}
`;

const StyledMessageSender = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ isCurrentUser }) => (isCurrentUser ? 'align-items: flex-end;' : '')}
`;

const StyledSenderName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledMessageTime = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledMessageContent = styled.div<{ isCurrentUser?: boolean }>`
  background-color: ${({ theme, isCurrentUser }) =>
    isCurrentUser ? theme.color.blue10 : theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  line-height: 1.5;
`;

const StyledMessageAttachments = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledAttachment = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledReplyButton = styled(Button)`
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

// Sample data types
type Attachment = {
  id: string;
  name: string;
  size: string;
};

type Message = {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  sentAt: Date;
  isCurrentUser: boolean;
  attachments?: Attachment[];
};

type MessageThread = {
  id: string;
  subject: string;
  messages: Message[];
};

// Format date to relative time (like "2 days ago", "Yesterday", "Just now")
const formatDateToRelative = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMilliseconds = now.getTime() - dateObj.getTime();
  const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInDays < 1) {
    if (diffInHours < 1) {
      return 'Just now';
    } else {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    }
  } else if (diffInDays < 2) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
};

type ConversationSectionProps = {
  inquiry: any;
  onClose: () => void;
};

export const ConversationSection = ({
  inquiry,
  onClose,
}: ConversationSectionProps) => {
  const theme = useTheme();
  const { messageThreads, isLoadingMessageThreads } = useInquiryPage();

  if (!inquiry) return null;

  return (
    <StyledConversationSection>
      <StyledHeader>
        <StyledProfileSection>
          <Button Icon={IconChevronLeft} variant="tertiary" onClick={onClose} />
          <StyledProfilePicture>
            {inquiry.person?.avatarUrl ? (
              <StyledProfileImage
                src={getImageAbsoluteURI({
                  imageUrl: inquiry.person.avatarUrl,
                  baseUrl: REACT_APP_SERVER_BASE_URL,
                })}
                alt={`${inquiry.person.name.firstName} ${inquiry.person.name.lastName}`}
              />
            ) : (
              <IconUser size={24} color={theme.font.color.light} />
            )}
          </StyledProfilePicture>
          <StyledProfileInfo>
            <StyledName>
              {inquiry.person.name.firstName} {inquiry.person.name.lastName}
            </StyledName>
            {inquiry.publication?.platform && (
              <StyledPlatform>
                <Trans>Inquiry from</Trans>
                <PlatformBadge
                  platformId={inquiry.publication.platform}
                  size="small"
                  variant="no-background"
                />
              </StyledPlatform>
            )}
          </StyledProfileInfo>
        </StyledProfileSection>
        <Button Icon={IconX} variant="tertiary" onClick={onClose} />
      </StyledHeader>
      <StyledContent>
        {isLoadingMessageThreads ? (
          <div>
            <Trans>Loading messages...</Trans>
          </div>
        ) : messageThreads && messageThreads.length > 0 ? (
          messageThreads.map((thread) => (
            <StyledThreadContainer key={thread.id}>
              <StyledThreadHeader>
                <StyledThreadSubject>
                  {thread.subject || 'Inquiry'}
                </StyledThreadSubject>
              </StyledThreadHeader>

              {thread.messages.map((message) => {
                const isCurrentUser = message.author?.displayName === 'You';
                return (
                  <StyledMessageContainer
                    key={message.id}
                    isCurrentUser={isCurrentUser}
                  >
                    <StyledMessageHeader isCurrentUser={isCurrentUser}>
                      <Avatar
                        type="rounded"
                        placeholder={message.author?.displayName || 'Unknown'}
                      />
                      <StyledMessageSender isCurrentUser={isCurrentUser}>
                        <StyledSenderName>
                          {message.author?.displayName || 'Unknown'}
                        </StyledSenderName>
                        <StyledMessageTime>
                          {formatDateToRelative(message.createdAt)}
                        </StyledMessageTime>
                      </StyledMessageSender>
                    </StyledMessageHeader>

                    <StyledMessageContent isCurrentUser={isCurrentUser}>
                      {message.text.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}

                      {/* Message attachments would go here if available in the API */}
                    </StyledMessageContent>

                    {!isCurrentUser && (
                      <StyledReplyButton
                        variant="secondary"
                        size="small"
                        title="Reply"
                        Icon={IconMessage}
                      />
                    )}
                  </StyledMessageContainer>
                );
              })}
            </StyledThreadContainer>
          ))
        ) : (
          <div>
            <Trans>No messages found for this inquiry.</Trans>
          </div>
        )}
      </StyledContent>
      <ReplyEditor
        subject={`Re: ${messageThreads?.[0]?.subject || 'Inquiry'}`}
        recipientName={`${inquiry.person.name.firstName} ${inquiry.person.name.lastName}`}
        recipientEmail={inquiry.person.email || ''}
        onSend={(content) => {
          console.log('Message sent:', content);
          // Here you would typically call an API to send the email
        }}
      />
    </StyledConversationSection>
  );
};

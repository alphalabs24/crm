import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  Avatar,
  Button,
  IconChevronLeft,
  IconMessage,
  IconPaperclip,
  IconUser,
  IconX,
} from 'twenty-ui';
import { getImageAbsoluteURI } from 'twenty-shared';
import { format } from 'date-fns';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

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

// Generate dummy message threads
const generateDummyThreads = (inquiry: any): MessageThread[] => {
  // Current user info (assuming it's a workspace member)
  const currentUser = {
    id: 'current-user',
    name: 'You',
    email: 'agent@nestermind.com',
    isCurrentUser: true,
  };

  // Customer info from inquiry
  const customer = {
    id: inquiry?.person?.id || 'customer',
    name: `${inquiry?.person?.name?.firstName || 'John'} ${inquiry?.person?.name?.lastName || 'Doe'}`,
    email: inquiry?.person?.email || 'john.doe@example.com',
    avatarUrl: inquiry?.person?.avatarUrl,
    isCurrentUser: false,
  };

  // Generate dates
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Create dummy threads
  return [
    {
      id: 'thread-1',
      subject: `Inquiry about ${inquiry?.property?.name || 'the property'}`,
      messages: [
        {
          id: 'msg-1',
          sender: customer,
          content: `Hi there, I'm interested in ${inquiry?.property?.name || 'this property'}. Could you please provide more information about its availability?`,
          sentAt: twoDaysAgo,
          isCurrentUser: false,
        },
        {
          id: 'msg-2',
          sender: currentUser,
          content: `Hello ${customer.name},\n\nThank you for your interest in our property. It is currently available for viewing. When would you like to schedule a visit?`,
          sentAt: yesterday,
          isCurrentUser: true,
        },
        {
          id: 'msg-3',
          sender: customer,
          content:
            'I would love to see it this weekend if possible. Is Saturday morning available? Also, could you send me some more pictures of the kitchen and bathroom?',
          sentAt: yesterday,
          isCurrentUser: false,
          attachments: [
            {
              id: 'att-1',
              name: 'requirements.pdf',
              size: '1.2 MB',
            },
          ],
        },
        {
          id: 'msg-4',
          sender: currentUser,
          content: `Saturday morning at 10 AM works perfectly. I've attached some additional photos of the kitchen and bathroom for your reference.`,
          sentAt: now,
          isCurrentUser: true,
          attachments: [
            {
              id: 'att-2',
              name: 'kitchen.jpg',
              size: '3.1 MB',
            },
            {
              id: 'att-3',
              name: 'bathroom.jpg',
              size: '2.8 MB',
            },
          ],
        },
      ],
    },
  ];
};

type ConversationSectionProps = {
  inquiry: any;
  onClose: () => void;
};

// Format date to relative time (like "2 days ago", "Yesterday", "Just now")
const formatDateToRelative = (date: Date): string => {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
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
    return format(date, 'MMM d, yyyy');
  }
};

export const ConversationSection = ({
  inquiry,
  onClose,
}: ConversationSectionProps) => {
  const theme = useTheme();

  if (!inquiry) return null;

  // Generate dummy message threads based on the inquiry
  const messageThreads = generateDummyThreads(inquiry);

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
        {messageThreads.map((thread) => (
          <StyledThreadContainer key={thread.id}>
            <StyledThreadHeader>
              <StyledThreadSubject>{thread.subject}</StyledThreadSubject>
            </StyledThreadHeader>

            {thread.messages.map((message) => (
              <StyledMessageContainer
                key={message.id}
                isCurrentUser={message.isCurrentUser}
              >
                <StyledMessageHeader isCurrentUser={message.isCurrentUser}>
                  <Avatar
                    type="rounded"
                    avatarUrl={message.sender.avatarUrl}
                    placeholder={message.sender.name}
                  />
                  <StyledMessageSender isCurrentUser={message.isCurrentUser}>
                    <StyledSenderName>{message.sender.name}</StyledSenderName>
                    <StyledMessageTime>
                      {formatDateToRelative(message.sentAt)} -{' '}
                      {message.sender.email}
                    </StyledMessageTime>
                  </StyledMessageSender>
                </StyledMessageHeader>

                <StyledMessageContent isCurrentUser={message.isCurrentUser}>
                  {message.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  {message.attachments && message.attachments.length > 0 && (
                    <StyledMessageAttachments>
                      {message.attachments.map((attachment) => (
                        <StyledAttachment key={attachment.id}>
                          <IconPaperclip size={12} />
                          {attachment.name} ({attachment.size})
                        </StyledAttachment>
                      ))}
                    </StyledMessageAttachments>
                  )}
                </StyledMessageContent>

                {!message.isCurrentUser && (
                  <StyledReplyButton
                    variant="secondary"
                    size="small"
                    title="Reply"
                    Icon={IconMessage}
                  />
                )}
              </StyledMessageContainer>
            ))}
          </StyledThreadContainer>
        ))}
      </StyledContent>
    </StyledConversationSection>
  );
};

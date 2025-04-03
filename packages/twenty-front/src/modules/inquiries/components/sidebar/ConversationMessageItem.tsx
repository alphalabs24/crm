import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button, ColorScheme, IconMessage } from 'twenty-ui';

const StyledMessageContainer = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: min(1200px, 90%);
  min-width: 40%;
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

const StyledMessageContent = styled.div<{
  isCurrentUser?: boolean;
  colorScheme: ColorScheme;
}>`
  background-color: ${({ theme, isCurrentUser, colorScheme }) =>
    isCurrentUser
      ? colorScheme === 'Light'
        ? theme.color.blue10
        : theme.color.gray
      : theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  line-height: 1.5;
`;

const StyledReplyButton = styled(Button)`
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

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

type ConversationMessageItemProps = {
  message: any;
  isCurrentUser: boolean;
  senderName: string;
};

export const ConversationMessageItem = ({
  message,
  isCurrentUser,
  senderName,
}: ConversationMessageItemProps) => {
  const { t } = useLingui();
  const { colorScheme } = useColorScheme();

  // Format message body
  const formatMessageBody = (body: string) => {
    const isHTML = /<[a-z][\s\S]*>/i.test(body);
    if (isHTML) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = body;
      return tempDiv.textContent || body;
    }
    return body;
  };

  const formattedBody = formatMessageBody(message.text);

  return (
    <StyledMessageContainer isCurrentUser={isCurrentUser}>
      <StyledMessageHeader isCurrentUser={isCurrentUser}>
        <StyledMessageSender isCurrentUser={isCurrentUser}>
          <StyledSenderName>{senderName}</StyledSenderName>
          <StyledMessageTime>
            {formatDateToRelative(message.createdAt)}
          </StyledMessageTime>
        </StyledMessageSender>
      </StyledMessageHeader>
      <StyledMessageContent
        isCurrentUser={isCurrentUser}
        colorScheme={colorScheme}
      >
        {formattedBody.split('\n').map((paragraph: string, index: number) => (
          <p key={index}>{paragraph}</p>
        ))}
      </StyledMessageContent>
      {!isCurrentUser && (
        <StyledReplyButton
          variant="secondary"
          size="small"
          title={t`Reply`}
          Icon={IconMessage}
          // TODO: Remove this once we have a reply feature
          disabled={true}
        />
      )}
    </StyledMessageContainer>
  );
};

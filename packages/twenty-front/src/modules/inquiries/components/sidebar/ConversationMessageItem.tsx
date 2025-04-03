import { OptionalWrap } from '@/ui/layout/utilities/components/OptionalWrapWith';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import { Link, To } from 'react-router-dom';
import { isDefined } from 'twenty-shared';
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
  gap: ${({ theme }) => theme.spacing(0.5)};
  ${({ isCurrentUser }) => (isCurrentUser ? 'align-items: flex-end;' : '')}
`;

const StyledSenderName = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
const StyledUnstyledLink = styled(Link)`
  text-decoration: none;
`;

const StyledMessageTime = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAutoTag = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
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

type ConversationMessageItemProps = {
  message: any;
  isCurrentUser: boolean;
  senderName: string;
  linkToPerson?: To;
};

export const ConversationMessageItem = ({
  message,
  isCurrentUser,
  senderName,
  linkToPerson,
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

  // Format date to relative time (like "2 days ago", "Yesterday", "Just now")
  const formatDateToRelative = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMilliseconds = now.getTime() - dateObj.getTime();
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInDays < 1) {
      if (diffInHours < 1) {
        return t`Just now`;
      } else {
        return `${Math.floor(diffInHours)} ${
          Math.floor(diffInHours) !== 1 ? t`hours ago` : t`hour ago`
        }`;
      }
    } else if (diffInDays < 2) {
      return t`Yesterday`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} ${
        Math.floor(diffInDays) !== 1 ? t`days ago` : t`day ago`
      }`;
    } else {
      return format(dateObj, 'MMM d, yyyy');
    }
  };

  const isAutomatic = !message.sender.person && !message.sender.workspaceMember;

  const formattedBody = formatMessageBody(message.text);

  return (
    <StyledMessageContainer isCurrentUser={isCurrentUser}>
      <StyledMessageHeader isCurrentUser={isCurrentUser}>
        <StyledMessageSender isCurrentUser={isCurrentUser}>
          <OptionalWrap
            With={<StyledUnstyledLink to={linkToPerson as To} />}
            condition={isDefined(linkToPerson)}
          >
            <StyledSenderName>{senderName}</StyledSenderName>
          </OptionalWrap>

          <StyledMessageTime>
            {formatDateToRelative(message.createdAt)}
            {isAutomatic && (
              <>
                {' • '}
                <StyledAutoTag>
                  <Trans>Auto Response</Trans>
                </StyledAutoTag>
              </>
            )}
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
          disabled={true}
        />
      )}
    </StyledMessageContainer>
  );
};

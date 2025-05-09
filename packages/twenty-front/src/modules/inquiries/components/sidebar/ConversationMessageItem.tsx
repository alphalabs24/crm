import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { OptionalWrap } from '@/ui/layout/utilities/components/OptionalWrapWith';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { de, enUS, es, fr, it } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import { useCallback, useMemo } from 'react';
import { Link, To } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { Button, ColorScheme, IconMessage } from 'twenty-ui';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

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

const StyledMessageContent = styled.div<{
  isCurrentUser?: boolean;
  colorScheme: ColorScheme;
  hasWorkspaceMember?: boolean;
}>`
  background-color: ${({
    theme,
    isCurrentUser,
    colorScheme,
    hasWorkspaceMember,
  }) =>
    isCurrentUser
      ? colorScheme === 'Light'
        ? theme.color.blue10
        : theme.color.blue60
      : hasWorkspaceMember
        ? theme.background.tertiary
        : theme.background.secondary};
          : theme.color.turquoise70};
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
  message: ObjectRecord;
  senderName: string;
  linkToPerson?: To;
  subject?: string;
  senderEmail?: string;
};

export const ConversationMessageItem = ({
  message,
  senderName,
  linkToPerson,
  subject = 'Your inquiry',
  senderEmail,
}: ConversationMessageItemProps) => {
  const { t, i18n } = useLingui();
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  const isHtml = /<([a-z]+)[\s>]|&[a-z]+;/i.test(message.text);
  const purify = DOMPurify(window);

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  // Helper to determine if a message is from the current user
  const isCurrentUser = useMemo(
    () => message.sender.workspaceMember?.id === currentWorkspaceMember?.id,
    [currentWorkspaceMember?.id, message.sender.workspaceMember?.id],
  );

  const hasWorkspaceMember = useMemo(() => {
    return Boolean(message.sender.workspaceMember);
  }, [message.sender.workspaceMember]);

  // Map lingui locale to date-fns locale
  const getDateFnsLocale = () => {
    const currentLocale = i18n.locale;

    if (currentLocale.startsWith('de')) return de;
    if (currentLocale.startsWith('es')) return es;
    if (currentLocale.startsWith('fr')) return fr;
    if (currentLocale.startsWith('it')) return it;

    return enUS; // Default to English
  };

  const sanitizedBody = useMemo(
    () => purify.sanitize(message.text),
    [message.text, purify],
  );

  const recipientEmail = useMemo(() => {
    return (
      senderEmail ||
      message.sender?.person?.email ||
      message.sender?.workspaceMember?.email ||
      message.sender?.handle
    );
  }, [
    message.sender.handle,
    message.sender.person?.email,
    message.sender.workspaceMember?.email,
    senderEmail,
  ]);

  const handleReplyClick = useCallback(() => {
    if (!recipientEmail) {
      return;
    }

    const date = new Date(message.createdAt).toLocaleString();

    // Format quoted text by prefixing each line with ">"
    const quotedText = message.text
      .split('\n')
      .map((line: string) => `> ${line}`)
      .join('\n');

    // Construct email body with quote
    const body = `\n\nOn ${date}, ${senderName} wrote:\n${quotedText}`;

    // Open default mail client with pre-filled data
    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent('Re: ' + subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  }, [message.createdAt, message.text, recipientEmail, senderName, subject]);

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

  const formattedBody = formatMessageBody(sanitizedBody);

  const canReply = Boolean(recipientEmail);

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
            {beautifyPastDateRelativeToNow(
              message.createdAt,
              getDateFnsLocale(),
            )}
            {/* {isAutomatic && (
              <>
                {' • '}
                <StyledAutoTag>
                  <Trans>Auto Response</Trans>
                </StyledAutoTag>
              </>
            )} */}
          </StyledMessageTime>
        </StyledMessageSender>
      </StyledMessageHeader>
      {isHtml ? (
        <StyledMessageContent
          isCurrentUser={isCurrentUser}
          colorScheme={colorSchemeToUse}
          hasWorkspaceMember={hasWorkspaceMember}
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />
      ) : (
        <StyledMessageContent
          isCurrentUser={isCurrentUser}
          colorScheme={colorSchemeToUse}
          hasWorkspaceMember={hasWorkspaceMember}
        >
          {formattedBody.split('\n').map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </StyledMessageContent>
      )}

      {!isCurrentUser && (
        <StyledReplyButton
          variant="secondary"
          size="small"
          title={t`Reply`}
          Icon={IconMessage}
          onClick={handleReplyClick}
          disabled={!canReply}
        />
      )}
    </StyledMessageContainer>
  );
};

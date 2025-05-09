import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useCallback, useEffect } from 'react';
import {
  Avatar,
  Button,
  ColorScheme,
  IconChevronLeft,
  IconMessageCircle2,
  IconX,
  MOBILE_VIEWPORT,
  useIsMobile,
} from 'twenty-ui';
import { useInquiryPage } from '../../contexts/InquiryPageContext';

import { CollapsedPropertyPreview } from '@/inquiries/components/sidebar/CollapsedPropertyPreview';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useTheme } from '@emotion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link } from 'react-router-dom';
import { ConversationMessageItem } from './ConversationMessageItem';
import { ReplyEditor } from './ReplyEditor';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

const StyledConversationSection = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 52px;

  @media (min-width: ${MOBILE_VIEWPORT + 1}px) {
    height: 42px;
  }
`;

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoMessagesContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(6)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

type ConversationSectionProps = {
  inquiry: any;
  onClose: () => void;
  onExpandProperty: () => void;
  isPropertyDetailsExpanded: boolean;
};

const StyledUnstyledLink = styled(Link)`
  text-decoration: none;
`;

const StyledSkeletonMessageContainer = styled.div<{
  isCurrentUser?: boolean;
  colorScheme: ColorScheme;
}>`
  align-items: ${({ isCurrentUser }) =>
    isCurrentUser ? 'flex-end' : 'flex-start'};
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme, isCurrentUser, colorScheme }) =>
    isCurrentUser
      ? colorScheme === 'Light'
        ? theme.color.blue10
        : theme.background.tertiary
      : theme.background.tertiary};
`;

const StyledSkeletonHeader = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  ${({ isCurrentUser }) =>
    isCurrentUser ? 'flex-direction: row-reverse;' : ''}
`;

const StyledSenderEmail = styled.button`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  margin: 0;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
    text-decoration: underline;
  }
`;

const StyledNameEmailContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonSender = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  ${({ isCurrentUser }) => (isCurrentUser ? 'align-items: flex-end;' : '')}
`;

const StyledSkeleton = styled(Skeleton)<{
  maxWidthPercentage?: number;
  minWidth?: number;
}>`
  max-width: ${({ maxWidthPercentage }) => maxWidthPercentage}%;
  min-width: ${({ minWidth }) => minWidth}px;
`;

const StyledSkeletonContent = styled.div<{
  isCurrentUser?: boolean;
  colorScheme: ColorScheme;
}>`
  background-color: ${({ theme, isCurrentUser, colorScheme }) =>
    isCurrentUser
      ? colorScheme === 'Light'
        ? theme.color.blue10
        : theme.background.tertiary
      : theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

// Create a skeleton message component
const MessageSkeletonItem = ({ isCurrentUser = false }) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  const isMobile = useIsMobile();

  return (
    <SkeletonTheme
      baseColor={
        isCurrentUser
          ? colorSchemeToUse === 'Light'
            ? theme.color.blue10
            : theme.background.secondary
          : theme.background.tertiary
      }
      highlightColor={
        colorSchemeToUse === 'Light'
          ? theme.background.transparent.lighter
          : theme.background.tertiary
      }
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonMessageContainer
        isCurrentUser={isCurrentUser}
        colorScheme={colorSchemeToUse}
      >
        <StyledSkeletonHeader isCurrentUser={isCurrentUser}>
          <StyledSkeletonSender isCurrentUser={isCurrentUser}>
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </StyledSkeletonSender>
        </StyledSkeletonHeader>
        <StyledSkeletonContent
          colorScheme={colorScheme}
          isCurrentUser={isCurrentUser}
        >
          <StyledSkeleton
            maxWidthPercentage={90}
            minWidth={isMobile ? 200 : 380}
            height={16}
            style={{ marginBottom: 8 }}
          />
          <Skeleton width={200} height={16} />
        </StyledSkeletonContent>
      </StyledSkeletonMessageContainer>
    </SkeletonTheme>
  );
};

// Create a skeleton loader for the conversation
const ConversationSkeletonLoader = () => {
  return (
    <>
      <MessageSkeletonItem />
      <MessageSkeletonItem isCurrentUser={true} />
      <MessageSkeletonItem />
      <MessageSkeletonItem isCurrentUser={true} />
      <MessageSkeletonItem />
    </>
  );
};

const CONVERSATION_SCROLL_WRAPPER_ID = 'conversation-scroll-wrapper';

export const ConversationSection = ({
  inquiry,
  onClose,
  onExpandProperty,
  isPropertyDetailsExpanded,
}: ConversationSectionProps) => {
  const { messages, thread, isLoadingMessages } = useInquiryPage();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [scrollInstance] = useRecoilComponentStateV2(
    scrollWrapperInstanceComponentState,
    CONVERSATION_SCROLL_WRAPPER_ID,
  );

  useEffect(() => {
    if (!isLoadingMessages && messages?.length > 0 && scrollInstance) {
      const { scrollOffsetElement } = scrollInstance.elements();
      scrollOffsetElement.scrollTop = scrollOffsetElement.scrollHeight;
    }
  }, [isLoadingMessages, messages?.length, scrollInstance]);

  const fullName = `${inquiry.person.name.firstName} ${inquiry.person.name.lastName}`;

  // Helper to determine if a message is from the current user
  const isCurrentUser = useCallback(
    (message: any) =>
      message.sender.workspaceMember?.id === currentWorkspaceMember?.id,
    [currentWorkspaceMember?.id],
  );

  const senderEmail = inquiry.person.emails.primaryEmail;

  const handleEmailClick = useCallback((email: string) => {
    const mailto = `mailto:${email}`;
    window.open(mailto, '_blank');
  }, []);

  if (!inquiry) return null;

  return (
    <StyledConversationSection>
      <StyledHeader>
        <StyledProfileSection>
          <Button Icon={IconChevronLeft} variant="tertiary" onClick={onClose} />
          <Avatar
            avatarUrl={inquiry.person?.avatarUrl}
            placeholder={fullName}
            size="xl"
            type="rounded"
          />
          <StyledProfileInfo>
            <StyledNameEmailContainer>
              <StyledUnstyledLink
                to={getLinkToShowPage(
                  CoreObjectNameSingular.Person,
                  inquiry.person,
                )}
              >
                <StyledName>{fullName}</StyledName>
              </StyledUnstyledLink>
              {senderEmail && (
                <StyledSenderEmail
                  onClick={() => handleEmailClick(senderEmail)}
                >
                  {senderEmail}
                </StyledSenderEmail>
              )}
            </StyledNameEmailContainer>
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
        <StyledHeaderActions>
          {inquiry.property && !isPropertyDetailsExpanded && (
            <CollapsedPropertyPreview
              property={inquiry.property}
              onExpand={onExpandProperty}
            />
          )}
          <Button Icon={IconX} variant="tertiary" onClick={onClose} />
        </StyledHeaderActions>
      </StyledHeader>
      <ScrollWrapper
        componentInstanceId={CONVERSATION_SCROLL_WRAPPER_ID}
        contextProviderName="showPageActivityContainer"
        heightMode="full"
        defaultEnableXScroll={false}
        scrollbarVariant="no-padding"
      >
        <StyledContent>
          {isLoadingMessages ? (
            <ConversationSkeletonLoader />
          ) : messages && messages.length > 0 ? (
            messages.map((message) => (
              <ConversationMessageItem
                key={message.id}
                message={message}
                linkToPerson={
                  message.sender.workspaceMember
                    ? undefined
                    : getLinkToShowPage(
                        CoreObjectNameSingular.Person,
                        inquiry.person,
                      )
                }
                senderEmail={senderEmail}
                senderName={
                  message.sender.workspaceMember
                    ? `${message.sender.workspaceMember.name.firstName} ${message.sender.workspaceMember.name.lastName}`
                    : fullName
                }
                isCurrentUser={isCurrentUser(message)}
              />
            ))
          ) : (
            <StyledNoMessagesContainer>
              <IconMessageCircle2 size={24} />
              <Trans>No messages yet</Trans>
            </StyledNoMessagesContainer>
          )}
        </StyledContent>
      </ScrollWrapper>
      <ReplyEditor
        subject={`Re: ${thread?.subject || 'Inquiry'}`}
        recipientName={`${inquiry.person.name.firstName} ${inquiry.person.name.lastName}`}
        recipientEmail={inquiry.person.emails?.primaryEmail || ''}
        comingSoon={true}
        onSend={(content) => {
          // TODO add reply fuctionality
        }}
      />
    </StyledConversationSection>
  );
};

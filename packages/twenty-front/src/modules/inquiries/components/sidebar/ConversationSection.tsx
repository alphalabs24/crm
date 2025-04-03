import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  Button,
  ColorScheme,
  IconChevronLeft,
  IconMessageCircle2,
  IconX,
} from 'twenty-ui';
import { useInquiryPage } from '../../contexts/InquiryPageContext';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { CollapsedPropertyPreview } from '@/inquiries/components/sidebar/CollapsedPropertyPreview';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useTheme } from '@emotion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { WorkspaceMember } from '~/generated/graphql';
import { ConversationMessageItem } from './ConversationMessageItem';
import { ReplyEditor } from './ReplyEditor';

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

const StyledSkeletonMessageContainer = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 90%;
  ${({ isCurrentUser }) => (isCurrentUser ? 'align-self: flex-end;' : '')}
`;

const StyledSkeletonHeader = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  ${({ isCurrentUser }) =>
    isCurrentUser ? 'flex-direction: row-reverse;' : ''}
`;

const StyledSenderEmail = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledNameEmailContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonSender = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  ${({ isCurrentUser }) => (isCurrentUser ? 'align-items: flex-end;' : '')}
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
`;

// Create a skeleton message component
const MessageSkeletonItem = ({ isCurrentUser = false }) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  return (
    <SkeletonTheme
      baseColor={
        isCurrentUser
          ? colorScheme === 'Light'
            ? theme.color.blue10
            : theme.background.secondary
          : theme.background.tertiary
      }
      highlightColor={
        colorScheme === 'Light'
          ? theme.background.transparent.lighter
          : theme.background.tertiary
      }
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonMessageContainer isCurrentUser={isCurrentUser}>
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
          <Skeleton width={280} height={16} style={{ marginBottom: 8 }} />
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
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
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

  if (!inquiry) return null;

  const fullName = `${inquiry.person.name.firstName} ${inquiry.person.name.lastName}`;

  // Helper to determine if a message is from the current user
  const isCurrentUser = (message: any) => {
    return (
      message.sender?.handle ===
      (currentWorkspaceMembers[0] as WorkspaceMember)?.userEmail
    );
  };

  const senderEmail = messages[0]?.sender?.person?.emails?.primaryEmail;

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
              <StyledName>{fullName}</StyledName>
              {senderEmail && (
                <StyledSenderEmail>{senderEmail}</StyledSenderEmail>
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

import styled from '@emotion/styled';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  H1Title,
  H1TitleFontColor,
  Section,
} from 'twenty-ui';

import { ActivityList } from '@/activities/components/ActivityList';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from '@/activities/emails/constants/Messaging';
import { getTimelineThreadsFromCompanyId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromCompanyId';
import { getTimelineThreadsFromPersonId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromPersonId';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCallback, useEffect, useState } from 'react';
import { TimelineThread, TimelineThreadsWithTotal } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6, 6, 2)};
  height: 100%;
  overflow: auto;
`;

const StyledH1Title = styled(H1Title)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmailCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

export const EmailThreads = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const [query, queryName] =
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [getTimelineThreadsFromPersonId, 'getTimelineThreadsFromPersonId']
      : [getTimelineThreadsFromCompanyId, 'getTimelineThreadsFromCompanyId'];

  const { messagesApi: messages } = useNestermind();

  const isPublication =
    targetableObject.targetObjectNameSingular ===
    CoreObjectNameSingular.Publication;

  const isBuyerLead =
    targetableObject.targetObjectNameSingular ===
    CoreObjectNameSingular.BuyerLead;

  const isProperty =
    targetableObject.targetObjectNameSingular ===
    CoreObjectNameSingular.Property;

  const [emailThreads, setEmailThreads] = useState<
    TimelineThread[] | undefined
  >(undefined);

  const [emailThreadsLoading, setEmailThreadsLoading] = useState(false);

  const shouldGetAggregated = isPublication || isBuyerLead || isProperty;

  const getMessagesAggregated = useCallback(async () => {
    if (!shouldGetAggregated) return [];
    try {
      setEmailThreadsLoading(true);
      const { data } = await messages.getRecordMessageThreads({
        id: targetableObject.id,
        objectNameSingular: targetableObject.targetObjectNameSingular,
      });
      console.log(data);

      setEmailThreads(data ?? []);
    } catch (error) {
      console.error('Error fetching email threads:', error);
    } finally {
      setEmailThreadsLoading(false);
    }
  }, [
    messages,
    shouldGetAggregated,
    targetableObject.id,
    targetableObject.targetObjectNameSingular,
  ]);

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords } =
    useCustomResolver<TimelineThreadsWithTotal>(
      query,
      queryName,
      'timelineThreads',
      targetableObject,
      TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
    );

  const { totalNumberOfThreads, timelineThreads } = data?.[queryName] ?? {};
  const hasMoreTimelineThreads =
    timelineThreads && totalNumberOfThreads
      ? timelineThreads?.length < totalNumberOfThreads
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreTimelineThreads) {
      await fetchMoreRecords();
    }
  };

  useEffect(() => {
    if (!emailThreads) {
      getMessagesAggregated();
    }
  }, [emailThreads, getMessagesAggregated]);

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (!firstQueryLoading && !emailThreads?.length && !timelineThreads?.length) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="emptyInbox" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Empty Inbox
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No email exchange has occurred with this record yet.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  // Show either nestermind threads or people threads
  const emailThreadsToShow =
    emailThreads && emailThreads.length > 0 ? emailThreads : timelineThreads;

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              Inbox{' '}
              <StyledEmailCount>
                {totalNumberOfThreads ||
                  (emailThreadsToShow ? emailThreadsToShow.length : 0)}
              </StyledEmailCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />
        {!firstQueryLoading && (
          <ActivityList>
            {emailThreadsToShow?.map((thread: TimelineThread) => (
              <EmailThreadPreview key={thread.id} thread={thread} />
            ))}
          </ActivityList>
        )}
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </Section>
    </StyledContainer>
  );
};

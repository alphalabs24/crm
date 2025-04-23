import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PublicationDetailPage } from '@/object-record/record-show/components/nm/publication/PublicationDetailPage';
import { NewPublicationCard } from '@/object-record/record-show/components/ui/NewPublicationCard';
import { PublicationGroup } from '@/object-record/record-show/components/ui/PublicationGroup';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import { PublicationDocumentsProvider } from '@/object-record/record-show/contexts/PublicationDocumentsProvider';
import { PublicationImagesProvider } from '@/object-record/record-show/contexts/PublicationImagesProvider';
import {
  PlatformId,
  PUBLISHABLE_PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { usePublications } from '@/ui/layout/show-page/contexts/PublicationsProvider';
import { OptionalWrap } from '@/ui/layout/utilities/components/OptionalWrapWith';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useEffect, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledPublicationListContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(8)};

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 1250px;
  }
`;

const StyledPublicationListHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSectionList = styled.div<{ horizontal?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;

  ${({ horizontal }) =>
    horizontal &&
    css`
      display: grid;
      grid-template-columns: 1fr;
    `}

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    ${({ horizontal }) =>
      horizontal &&
      css`
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      `}
  }

  @media (min-width: ${MOBILE_VIEWPORT + 300}px) {
    ${({ horizontal }) =>
      horizontal &&
      css`
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      `}
  }
`;

const StyledSectionTitle = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledSectionDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledPublicationListDivider = styled.div`
  background-color: ${({ theme }) => theme.border.color.light};
  height: 1px;
`;

// Create styled components for skeleton loader
const StyledSkeletonCard = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};

  overflow: hidden;
`;

const StyledSkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledSkeletonPlatformIcon = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  height: 32px;
  width: 32px;
`;

const StyledSkeletonPlatformInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
`;

const StyledSkeletonStatusChips = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// Create a skeleton publication group component
const PublicationGroupSkeleton = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonCard>
        <StyledSkeletonHeader>
          <div
            style={{
              display: 'flex',
              gap: theme.spacing(3),
              alignItems: 'center',
            }}
          >
            <StyledSkeletonPlatformIcon />
            <StyledSkeletonPlatformInfo>
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} />
            </StyledSkeletonPlatformInfo>
          </div>
          <StyledSkeletonStatusChips>
            <Skeleton width={60} height={20} />
          </StyledSkeletonStatusChips>
        </StyledSkeletonHeader>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};

// Create a skeleton loader for the new publication section
const NewPublicationSkeletonCard = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonCard style={{ width: '220px', height: '140px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2),
          }}
        >
          <StyledSkeletonPlatformIcon
            style={{ width: '48px', height: '48px' }}
          />
          <Skeleton
            width={100}
            height={16}
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
          />
          <Skeleton
            width={120}
            height={32}
            style={{ marginTop: theme.spacing(1) }}
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
          />
        </div>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};

// Skeleton loader for the entire publication list
const PublicationListSkeleton = () => {
  const theme = useTheme();
  return (
    <StyledPublicationListContainer>
      <StyledSection>
        <StyledPublicationListHeader>
          <Skeleton
            width={150}
            height={20}
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
          />
          <Skeleton
            width={250}
            height={16}
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
          />
        </StyledPublicationListHeader>
        <StyledSectionList>
          {Array.from({ length: 3 }).map((_, index) => (
            <PublicationGroupSkeleton key={`publication-skeleton-${index}`} />
          ))}
        </StyledSectionList>
      </StyledSection>

      <StyledPublicationListDivider />

      <StyledSection>
        <StyledPublicationListHeader>
          <Skeleton
            width={150}
            height={20}
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
          />
          <Skeleton
            width={250}
            height={16}
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
          />
        </StyledPublicationListHeader>
        <StyledSectionList horizontal>
          {Array.from({ length: 4 }).map((_, index) => (
            <NewPublicationSkeletonCard
              key={`new-publication-skeleton-${index}`}
            />
          ))}
        </StyledSectionList>
      </StyledSection>
    </StyledPublicationListContainer>
  );
};

type PublicationListProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
};

export const PublicationList = ({
  targetableObject,
  isInRightDrawer,
}: PublicationListProps) => {
  const {
    publicationGroupsWithoutAll: publicationGroups,
    loading,
    refetch,
  } = usePublications();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPlatformId = searchParams.get('platform') as PlatformId;
  const currentHash = location.hash;

  const draftRecord = useMemo(() => {
    return publicationGroups[selectedPlatformId]?.[PublicationStage.Draft]?.[0];
  }, [publicationGroups, selectedPlatformId]);

  const publishedRecord = useMemo(() => {
    return publicationGroups[selectedPlatformId]?.[
      PublicationStage.Published
    ]?.[0];
  }, [publicationGroups, selectedPlatformId]);

  // Handles wrapping with image provider
  const provideImages = useMemo(() => {
    return draftRecord && publishedRecord;
  }, [draftRecord, publishedRecord]);

  // Handles wrapping with document provider - same condition as images
  const provideDocuments = useMemo(() => {
    return draftRecord && publishedRecord;
  }, [draftRecord, publishedRecord]);

  const unpublishedPublishablePlatforms = useMemo(() => {
    return PUBLISHABLE_PLATFORMS.filter((platform) => {
      return !Object.keys(publicationGroups).includes(platform as PlatformId);
    });
  }, [publicationGroups]);

  // TODO: Add Diff Indicator Stage (e.g. has unpublished changes)
  const computeStage = (publishedRecords?: Record<string, any>[]) => {
    if (!publishedRecords || publishedRecords.length === 0) {
      return PublicationStage.Draft;
    }

    return PublicationStage.Published;
  };

  // Update URL with platform parameter while preserving hash fragment
  const handlePlatformClick = (platformId: PlatformId) => {
    // Create a new URLSearchParams object to update the query params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('platform', platformId);

    // Construct the new URL with both search params and hash
    navigate({
      pathname: location.pathname,
      search: newParams.toString(),
      hash: currentHash,
    });
  };

  // Restore the hash when coming back from PublicationDetailPage
  useEffect(() => {
    // This ensures hash is properly restored after navigation
    if (currentHash && !selectedPlatformId) {
      const tabElement = document.querySelector(currentHash);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedPlatformId, currentHash]);

  // Show Skeleton when loading
  if (loading) {
    return <PublicationListSkeleton />;
  }

  if (selectedPlatformId && publicationGroups?.[selectedPlatformId]) {
    return (
      <OptionalWrap
        condition={provideImages}
        With={
          <PublicationImagesProvider
            draftRecord={draftRecord}
            publishedRecord={publishedRecord}
          />
        }
      >
        <OptionalWrap
          condition={provideDocuments}
          With={
            <PublicationDocumentsProvider
              draftRecord={draftRecord}
              publishedRecord={publishedRecord}
            />
          }
        >
          <PublicationDetailPage
            publicationGroup={publicationGroups[selectedPlatformId]}
            stage={computeStage(
              publicationGroups[selectedPlatformId][PublicationStage.Published],
            )}
            selectedPlatformId={selectedPlatformId}
            recordLoading={loading}
            isInRightDrawer={isInRightDrawer}
            refetch={refetch}
          />
        </OptionalWrap>
      </OptionalWrap>
    );
  }

  return (
    <StyledPublicationListContainer>
      {Object.keys(publicationGroups).length > 0 && (
        <StyledSection>
          <StyledPublicationListHeader>
            <StyledSectionTitle>
              <Trans>Your publications</Trans>
            </StyledSectionTitle>
            <StyledSectionDescription>
              <Trans>Here you can see all your publications.</Trans>
            </StyledSectionDescription>
          </StyledPublicationListHeader>
          <StyledSectionList>
            {Object.keys(publicationGroups).map((platform) => {
              // Handle these for each group
              const draftRecord =
                publicationGroups[platform as PlatformId][
                  PublicationStage.Draft
                ]?.[0];
              const publishedRecord =
                publicationGroups[platform as PlatformId][
                  PublicationStage.Published
                ]?.[0];
              const provideImages = draftRecord && publishedRecord;
              const provideDocuments = draftRecord && publishedRecord;
              return (
                <OptionalWrap
                  condition={provideImages}
                  With={
                    <PublicationImagesProvider
                      draftRecord={draftRecord}
                      publishedRecord={publishedRecord}
                    />
                  }
                >
                  <OptionalWrap
                    condition={provideDocuments}
                    With={
                      <PublicationDocumentsProvider
                        draftRecord={draftRecord}
                        publishedRecord={publishedRecord}
                      />
                    }
                  >
                    <PublicationGroup
                      key={platform}
                      platform={platform as PlatformId}
                      draftRecord={draftRecord}
                      publishedRecord={publishedRecord}
                      onClick={() =>
                        handlePlatformClick(platform as PlatformId)
                      }
                      stage={computeStage(
                        publicationGroups[platform as PlatformId][
                          PublicationStage.Published
                        ],
                      )}
                    />
                  </OptionalWrap>
                </OptionalWrap>
              );
            })}
          </StyledSectionList>
        </StyledSection>
      )}

      {Object.keys(publicationGroups).length > 0 &&
        unpublishedPublishablePlatforms.length > 0 && (
          <>
            <StyledPublicationListDivider />
          </>
        )}

      {unpublishedPublishablePlatforms.length > 0 && (
        <StyledSection>
          <StyledPublicationListHeader>
            <StyledSectionTitle>
              <Trans>New publication</Trans>
            </StyledSectionTitle>
            <StyledSectionDescription>
              <Trans>Publish your property on a new platform.</Trans>
            </StyledSectionDescription>
          </StyledPublicationListHeader>

          <StyledSectionList horizontal>
            {unpublishedPublishablePlatforms.map((platform) => (
              <NewPublicationCard
                key={platform}
                platform={platform}
                onClick={() => {}}
                propertyId={targetableObject.id}
                refetchCallback={refetch}
              />
            ))}
          </StyledSectionList>
        </StyledSection>
      )}
    </StyledPublicationListContainer>
  );
};

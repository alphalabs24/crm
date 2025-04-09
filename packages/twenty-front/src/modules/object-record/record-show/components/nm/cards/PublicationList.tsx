import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PublicationDetailPage } from '@/object-record/record-show/components/nm/publication/PublicationDetailPage';
import { NewPublicationCard } from '@/object-record/record-show/components/ui/NewPublicationCard';
import { PublicationGroup } from '@/object-record/record-show/components/ui/PublicationGroup';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import {
    PlatformId,
    PUBLISHABLE_PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { usePublicationsOfProperty } from '@/ui/layout/show-page/hooks/usePublicationsOfProperty';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledPublicationListContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(8)};
  max-width: ${LARGE_DESKTOP_VIEWPORT}px;
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

type PublicationListProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
};

export const PublicationList = ({ targetableObject }: PublicationListProps) => {
  const { publicationGroups, loading, refetch } = usePublicationsOfProperty(
    targetableObject.id,
  );
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPlatformId = searchParams.get('platform') as PlatformId;
  const currentHash = location.hash;

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

  if (selectedPlatformId && publicationGroups?.[selectedPlatformId]) {
    return (
      <PublicationDetailPage
        publicationGroup={publicationGroups[selectedPlatformId]}
        stage={computeStage(
          publicationGroups[selectedPlatformId][PublicationStage.Published],
        )}
        recordLoading={loading}
        isInRightDrawer={false}
      />
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
            {Object.keys(publicationGroups).map((platform) => (
              <PublicationGroup
                key={platform}
                platform={platform as PlatformId}
                draftRecord={
                  publicationGroups[platform as PlatformId][
                    PublicationStage.Draft
                  ]?.[0]
                }
                publishedRecord={
                  publicationGroups[platform as PlatformId][
                    PublicationStage.Published
                  ]?.[0]
                }
                onClick={() => handlePlatformClick(platform as PlatformId)}
                stage={computeStage(
                  publicationGroups[platform as PlatformId][
                    PublicationStage.Published
                  ],
                )}
              />
            ))}
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

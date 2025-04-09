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
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LARGE_DESKTOP_VIEWPORT } from 'twenty-ui';

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

const StyledSectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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
  const { publicationGroups, loading } = usePublicationsOfProperty(
    targetableObject.id,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPlatformId = searchParams.get('platform') as PlatformId;

  const unpublishedPublishablePlatforms = useMemo(() => {
    return PUBLISHABLE_PLATFORMS.filter((platform) => {
      return !Object.keys(publicationGroups).includes(platform as PlatformId);
    });
  }, [publicationGroups]);

  // TODO: Add Diff Indicator Stage (e.g. has unpublished changes)
  const computeStage = (publishedRecords?: Record<string, any>[]) => {
    if (publishedRecords?.length === 0) {
      return PublicationStage.Draft;
    }

    return PublicationStage.Published;
  };

  const handlePlatformClick = (platformId: PlatformId) => {
    setSearchParams({ platform: platformId });
  };

  if (selectedPlatformId) {
    return (
      <PublicationDetailPage
        publicationGroup={publicationGroups?.[selectedPlatformId]}
        stage={computeStage(publicationGroups?.[selectedPlatformId]?.published)}
        recordLoading={loading}
        isInRightDrawer={false}
      />
    );
  }

  return (
    <StyledPublicationListContainer>
      <StyledSection>
        <StyledPublicationListHeader>
          <StyledSectionTitle>
            <Trans>Your publications</Trans>
          </StyledSectionTitle>
          <StyledSectionDescription>
            <Trans>
              Here you can see all your publications and add new ones.
            </Trans>
          </StyledSectionDescription>
        </StyledPublicationListHeader>
        <StyledSectionList>
          {Object.keys(publicationGroups).map((platform) => (
            <PublicationGroup
              key={platform}
              platform={platform as PlatformId}
              records={
                publicationGroups[platform as PlatformId][
                  computeStage(
                    publicationGroups[platform as PlatformId]?.published,
                  )
                ]
              }
              onClick={() => handlePlatformClick(platform as PlatformId)}
              stage={computeStage(
                publicationGroups[platform as PlatformId]?.published,
              )}
            />
          ))}
        </StyledSectionList>
      </StyledSection>

      <StyledPublicationListDivider />

      <StyledSection>
        <StyledPublicationListHeader>
          <StyledSectionTitle>
            <Trans>New publication</Trans>
          </StyledSectionTitle>
          <StyledSectionDescription>
            <Trans>Publish your property on a new platform.</Trans>
          </StyledSectionDescription>
        </StyledPublicationListHeader>
        {unpublishedPublishablePlatforms.length > 0 && (
          <StyledSectionList>
            {unpublishedPublishablePlatforms.map((platform) => (
              <NewPublicationCard
                key={platform}
                platform={platform}
                onClick={() => {}}
              />
            ))}
          </StyledSectionList>
        )}
      </StyledSection>
    </StyledPublicationListContainer>
  );
};

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { PropertyReportingCard } from '@/object-record/record-show/components/nm/cards/PropertyReportingCard';
import { PublicationCompletionCard } from '@/object-record/record-show/components/nm/cards/PublicationCompletionCard';
import { PublicationStatusCard } from '@/object-record/record-show/components/nm/cards/PublicationStatusCard';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    IconChevronLeft,
    LARGE_DESKTOP_VIEWPORT,
    MOBILE_VIEWPORT,
} from 'twenty-ui';

const StyledPageContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(4)};

    ${({ isInRightDrawer }) =>
      isInRightDrawer &&
      css`
        padding: 0;
      `}
  }
`;

const StyledContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;

    ${({ isInRightDrawer }) =>
      isInRightDrawer &&
      css`
        flex-direction: column;

        padding: 0;
      `}
  }
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex: 1;
    min-width: 0;
  }

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 1250px;
  }
`;

const StyledSideContent = styled.div<{ isInRightDrawer?: boolean }>`
  display: none;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    width: 380px;
  }
`;

const StyledImagesSection = styled.div`
  width: 100%;
`;

const StyledOverviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    > * {
      flex: 1;
      min-width: 300px;
    }
  }
`;

const StyledDetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    > * {
      flex: 1;
      min-width: 300px;
    }
  }
`;

const StyledPageHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(0, 0, 4)};
`;

const StyledBackButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
`;

type PublicationDetailPageProps = {
  publicationGroup: Record<PublicationStage, ObjectRecord[]>;

  stage: PublicationStage;
  isInRightDrawer?: boolean;
  recordLoading: boolean;
};

export const PublicationDetailPage = ({
  publicationGroup,
  stage,
  isInRightDrawer,
  recordLoading,
}: PublicationDetailPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Publication,
  });

  const publication = useMemo(() => {
    return publicationGroup[stage][0];
  }, [publicationGroup, stage]);

  const handleBackClick = () => {
    // Create a new URLSearchParams object based on the current one
    const newParams = new URLSearchParams(searchParams);
    // Remove the platform parameter
    newParams.delete('platform');
    // Set the new params
    setSearchParams(newParams);
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledBackButton onClick={handleBackClick}>
          <IconChevronLeft size={20} />
          <span>Back to list</span>
        </StyledBackButton>
      </StyledPageHeader>
      <StyledContentContainer isInRightDrawer={isInRightDrawer}>
        <StyledMainContent>
          <StyledImagesSection>
            <PropertyImagesCard
              loading={recordLoading}
              targetableObject={{
                id: publication.id,
                targetObjectNameSingular: CoreObjectNameSingular.Publication,
              }}
            />
          </StyledImagesSection>

          <StyledOverviewSection>
            <PropertyBasicInfoCard
              record={publication}
              loading={recordLoading}
              isPublication
            />
            <PropertyDetailsCard
              record={publication}
              loading={recordLoading}
              objectMetadataItem={objectMetadataItem}
            />
          </StyledOverviewSection>

          <StyledDetailsSection>
            <PropertyRelationsCard
              record={publication}
              loading={recordLoading}
              objectMetadataItem={objectMetadataItem}
            />
            <PropertyAddressCard record={publication} loading={recordLoading} />
          </StyledDetailsSection>
        </StyledMainContent>

        <StyledSideContent isInRightDrawer={isInRightDrawer}>
          <PublicationCompletionCard record={publication} />
          <PublicationStatusCard stage={publication.stage} />
          <PropertyInquiriesCard recordId={publication.id} isPublication />
          <PropertyReportingCard />
        </StyledSideContent>
      </StyledContentContainer>
    </StyledPageContainer>
  );
};

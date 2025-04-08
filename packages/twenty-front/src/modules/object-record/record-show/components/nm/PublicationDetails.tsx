import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { PropertyReportingCard } from '@/object-record/record-show/components/nm/cards/PropertyReportingCard';
import { PublicationCompletionCard } from '@/object-record/record-show/components/nm/cards/PublicationCompletionCard';
import { PublicationStatusCard } from '@/object-record/record-show/components/nm/cards/PublicationStatusCard';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { usePropertyOfPublication } from '@/object-record/record-show/hooks/usePropertyOfPublication';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    padding: ${({ theme }) => theme.spacing(4)};

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

const StyledPropertySection = styled.div`
  display: none;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    max-width: 800px;
    width: 100%;
  }
`;

type PublicationDetailsProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
  isInRightDrawer?: boolean;
};

export const PublicationDetails = ({
  targetableObject,
  isInRightDrawer,
}: PublicationDetailsProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const { recordFromStore: publication, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  const property = usePropertyOfPublication({
    publication,
  });

  if (recordLoading || !publication) {
    return (
      <StyledLoadingContainer>
        <Trans>Loading...</Trans>
      </StyledLoadingContainer>
    );
  }

  // TODO add tab cards for inquiries, publications and reporting on mobile
  return (
    <StyledContentContainer isInRightDrawer={isInRightDrawer}>
      <StyledMainContent>
        <StyledImagesSection>
          <PropertyImagesCard
            loading={recordLoading}
            targetableObject={targetableObject}
          />
        </StyledImagesSection>

        <StyledOverviewSection>
          <PropertyBasicInfoCard
            record={publication}
            loading={recordLoading}
            isPublication
            property={property}
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
  );
};

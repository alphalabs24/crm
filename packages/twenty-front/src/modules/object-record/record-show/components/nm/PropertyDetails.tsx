import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import { PropertyPublicationsCard } from '@/object-record/record-show/components/nm/cards/PropertyPublicationsCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { PropertyReportingCard } from '@/object-record/record-show/components/nm/cards/PropertyReportingCard';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  useIsMobile,
} from 'twenty-ui';

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

const StyledDetailsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const StyledPublicationsSection = styled.div`
  display: none;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    width: 100%;
  }
`;

export const StyledComingSoonText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

type PropertyDetailsProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
  isInRightDrawer?: boolean;
};

export const PropertyDetails = ({
  targetableObject,
  isInRightDrawer,
}: PropertyDetailsProps) => {
  const isMobile = useIsMobile();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const { recordFromStore: property, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  if (recordLoading || !property) {
    return (
      <StyledLoadingContainer>
        <Trans>Loading...</Trans>
      </StyledLoadingContainer>
    );
  }

  return (
    <StyledContentContainer isInRightDrawer={isInRightDrawer}>
      <StyledMainContent>
        <StyledImagesSection>
          <PropertyImagesCard
            loading={recordLoading}
            targetableObject={targetableObject}
          />
        </StyledImagesSection>

        <StyledDetailsSection>
          <PropertyBasicInfoCard record={property} loading={recordLoading} />
          <PropertyDetailsCard
            record={property}
            loading={recordLoading}
            objectMetadataItem={objectMetadataItem}
          />
        </StyledDetailsSection>

        <StyledDetailsSection>
          <PropertyRelationsCard
            record={property}
            loading={recordLoading}
            objectMetadataItem={objectMetadataItem}
          />
          <PropertyAddressCard record={property} loading={recordLoading} />
        </StyledDetailsSection>

        <StyledPublicationsSection>
          <PropertyPublicationsCard record={property} loading={recordLoading} />
        </StyledPublicationsSection>
      </StyledMainContent>

      {isMobile ? null : (
        <StyledSideContent isInRightDrawer={isInRightDrawer}>
          <PropertyInquiriesCard recordId={property.id} />
          <PropertyReportingCard />
        </StyledSideContent>
      )}
    </StyledContentContainer>
  );
};

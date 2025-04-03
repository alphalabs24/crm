import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { InquiriesPreview } from '@/inquiries/components/InquiriesPreview';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyPublicationsCard } from '@/object-record/record-show/components/nm/cards/PropertyPublicationsCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { ContactsByPlatformChart } from '@/object-record/record-show/components/nm/property/ContactsByPlatformChart';
import {
  Section,
  StyledLoadingContainer,
} from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { propertyPlatformMetricsState } from '@/object-record/record-show/states/propertyPlatformMetricsState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import {
  IconChartBar,
  IconMessageCircle2,
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

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    > * {
      flex: 1;
    }
  }
`;

const StyledDetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-direction: row;
    flex-wrap: wrap;
    > * {
      flex: 1;
      min-width: 300px;
    }
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
  const { t } = useLingui();

  const isMobile = useIsMobile();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const { recordFromStore: property, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  const propertyPlatformMetrics = useRecoilValue(
    propertyPlatformMetricsState(targetableObject.id),
  );

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

        <StyledOverviewSection>
          <PropertyBasicInfoCard record={property} loading={recordLoading} />

          <PropertyDetailsCard
            record={property}
            loading={recordLoading}
            objectMetadataItem={objectMetadataItem}
          />
        </StyledOverviewSection>

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
          <Section
            title={t`Inquiries Overview`}
            icon={<IconMessageCircle2 size={16} />}
            preserveHeight
          >
            {propertyPlatformMetrics?.contactsByPlatform && (
              <ContactsByPlatformChart
                contactsByPlatform={propertyPlatformMetrics.contactsByPlatform}
                totalContacts={propertyPlatformMetrics.contacts}
              />
            )}
            <InquiriesPreview propertyId={property.id} maxItems={5} />
          </Section>

          <Section
            title={t`Reporting`}
            icon={<IconChartBar size={16} />}
            preserveHeight
          >
            <StyledComingSoonText>
              <Trans>Reporting coming soon</Trans>
            </StyledComingSoonText>
          </Section>
        </StyledSideContent>
      )}
    </StyledContentContainer>
  );
};

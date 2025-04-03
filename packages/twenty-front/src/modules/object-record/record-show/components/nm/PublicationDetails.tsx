import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { InquiriesPreview } from '@/inquiries/components/InquiriesPreview';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PropertyAddressCard } from '@/object-record/record-show/components/nm/cards/PropertyAddressCard';
import { PropertyBasicInfoCard } from '@/object-record/record-show/components/nm/cards/PropertyBasicInfoCard';
import { PropertyDetailsCard } from '@/object-record/record-show/components/nm/cards/PropertyDetailsCard';
import { PropertyImagesCard } from '@/object-record/record-show/components/nm/cards/PropertyImagesCard';
import { PropertyRelationsCard } from '@/object-record/record-show/components/nm/cards/PropertyRelationsCard';
import { ContactsByStageChart } from '@/object-record/record-show/components/nm/publication/ContactsByStageChart';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import {
  Section,
  StyledComingSoonText,
  StyledLoadingContainer,
  StyledProgressContainer,
} from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { publicationMetricsState } from '@/object-record/record-show/states/publicationMetricsState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import {
  IconBuildingSkyscraper,
  IconChartBar,
  IconMessageCircle2,
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
} from 'twenty-ui';
import { CompletionProgress } from './publication/CompletionProgress';

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
    max-width: calc(100% - 400px);
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
  const { t } = useLingui();
  const publicationMetrics = useRecoilValue(
    publicationMetricsState(targetableObject.id),
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const { recordFromStore: publication, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  if (recordLoading || !publication) {
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
          <PropertyBasicInfoCard record={publication} loading={recordLoading} />
          <PropertyRelationsCard
            record={publication}
            loading={recordLoading}
            objectMetadataItem={objectMetadataItem}
          />
        </StyledOverviewSection>

        <StyledDetailsSection>
          <PropertyDetailsCard
            record={publication}
            loading={recordLoading}
            objectMetadataItem={objectMetadataItem}
          />
          <PropertyAddressCard record={publication} loading={recordLoading} />
        </StyledDetailsSection>
      </StyledMainContent>

      <StyledSideContent isInRightDrawer={isInRightDrawer}>
        <StyledProgressContainer>
          <CompletionProgress record={publication} />
        </StyledProgressContainer>

        <Section
          title={t`Status`}
          icon={<IconBuildingSkyscraper size={16} />}
          preserveHeight
        >
          <StatusBadge status={publication.stage} />
        </Section>

        <Section
          title={t`Inquiries Overview`}
          icon={<IconMessageCircle2 size={16} />}
          preserveHeight
        >
          {publicationMetrics?.contactsByStage && (
            <ContactsByStageChart
              contactsByStage={publicationMetrics.contactsByStage}
            />
          )}
          <InquiriesPreview publicationId={publication.id} maxItems={5} />
        </Section>

        <Section title={t`Reporting`} icon={<IconChartBar size={16} />}>
          <StyledComingSoonText>
            <Trans>Reporting coming soon</Trans>
          </StyledComingSoonText>
        </Section>
      </StyledSideContent>
    </StyledContentContainer>
  );
};

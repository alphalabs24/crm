import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
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
} from 'twenty-ui';
import { ObjectOverview } from './ObjectOverview';
import { InquiriesPreview } from '@/inquiries/components/InquiriesPreview';

const StyledContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap-reverse;

  padding: ${({ theme }) => theme.spacing(2)};

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-wrap: nowrap;
    width: unset;
    gap: ${({ theme }) => theme.spacing(4)};
    padding: ${({ theme }) => theme.spacing(4)};

    ${({ isInRightDrawer }) =>
      isInRightDrawer &&
      css`
        width: 100%;
        padding: 0;
        flex-wrap: wrap;
      `}
  }
`;

export const StyledComingSoonText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledRightContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  width: 100%;
  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 900px;
    padding: 0;
    ${({ isInRightDrawer, theme }) =>
      isInRightDrawer &&
      css`
        padding: 0 ${theme.spacing(4)};
        width: 100%;
      `}
  }
`;

const StyledLeftContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 900px;

    padding: 0;
    ${({ isInRightDrawer, theme }) =>
      isInRightDrawer &&
      css`
        padding: 0 ${theme.spacing(4)};
        width: 100%;
      `}
  }
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
    <>
      <StyledContentContainer isInRightDrawer={isInRightDrawer}>
        <StyledLeftContentContainer isInRightDrawer={isInRightDrawer}>
          <ObjectOverview
            targetableObject={targetableObject}
            isInRightDrawer={isInRightDrawer}
            isNewRightDrawerItemLoading={false}
          />
        </StyledLeftContentContainer>
        <StyledRightContentContainer isInRightDrawer={isInRightDrawer}>
          <Section
            title={t`Inquiries Overview`}
            icon={<IconMessageCircle2 size={16} />}
          >
            {propertyPlatformMetrics?.contactsByPlatform ? (
              <ContactsByPlatformChart
                contactsByPlatform={propertyPlatformMetrics.contactsByPlatform}
                totalContacts={propertyPlatformMetrics.contacts}
              />
            ) : (
              <Trans>No inquiries data available yet</Trans>
            )}
            <InquiriesPreview propertyId={property.id} maxItems={5} />
          </Section>

          <Section title={t`Reporting`} icon={<IconChartBar size={16} />}>
            <StyledComingSoonText>
              <Trans>Reporting coming soon</Trans>
            </StyledComingSoonText>
          </Section>
        </StyledRightContentContainer>
      </StyledContentContainer>
    </>
  );
};

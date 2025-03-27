import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ContactsByStageChart } from '@/object-record/record-show/components/nm/publication/ContactsByStageChart';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import {
  Section,
  StyledChartContainer,
  StyledComingSoonText,
  StyledEmptyState,
  StyledLoadingContainer,
  StyledProgressContainer,
} from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { publicationMetricsState } from '@/object-record/record-show/states/publicationMetricsState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconBuildingSkyscraper,
  IconChartBar,
  IconMessageCircle2,
  LARGE_DESKTOP_VIEWPORT,
} from 'twenty-ui';
import { ObjectOverview } from './ObjectOverview';
import { CompletionProgress } from './publication/CompletionProgress';

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

type PublicationDetailsProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
  isInRightDrawer?: boolean;
};

const fieldToIgnore = ['id', '__typename', 'createdAt', 'updatedAt', 'stage'];

export const PublicationDetails = ({
  targetableObject,
  isInRightDrawer,
}: PublicationDetailsProps) => {
  const { t } = useLingui();
  const publicationMetrics = useRecoilValue(
    publicationMetricsState(targetableObject.id),
  );

  const { recordFromStore: publication, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  const definedValuePercentage = useMemo(() => {
    const definedValues = Object.values(publication ?? {}).filter(
      (value) => value !== null && !fieldToIgnore.includes(value),
    );
    return (definedValues.length / Object.keys(publication ?? {}).length) * 100;
  }, [publication]);

  // TODO: Add a skeleton loader here
  if (recordLoading || !publication) {
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
            isPublication
          />
        </StyledLeftContentContainer>
        <StyledRightContentContainer isInRightDrawer={isInRightDrawer}>
          <StyledProgressContainer>
            <CompletionProgress percentage={definedValuePercentage} />
          </StyledProgressContainer>

          <Section
            title={t`Status`}
            icon={<IconBuildingSkyscraper size={16} />}
          >
            <StatusBadge status={publication.stage} />
          </Section>

          <Section title={t`Inquiries`} icon={<IconMessageCircle2 size={16} />}>
            {publicationMetrics?.contactsByStage ? (
              <StyledChartContainer>
                <ContactsByStageChart
                  contactsByStage={publicationMetrics.contactsByStage}
                />
              </StyledChartContainer>
            ) : (
              <StyledEmptyState>
                <Trans>No inquiries data available yet</Trans>
              </StyledEmptyState>
            )}
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

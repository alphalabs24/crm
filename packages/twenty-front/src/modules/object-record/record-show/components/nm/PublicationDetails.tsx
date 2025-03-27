import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ContactsByStageChart } from '@/object-record/record-show/components/nm/publication/ContactsByStageChart';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
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
  width: 100%;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-wrap: nowrap;
    width: unset;
    padding: 0 ${({ theme }) => theme.spacing(4)} 0 0;

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
  margin: ${({ theme }) => theme.spacing(4)} 0;

  padding: ${({ theme }) => theme.spacing(4)};

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

const StyledSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  width: 100%;
  overflow: hidden;
`;

const StyledSectionTitle = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const StyledSectionContent = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledChartContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledComingSoonText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledEmptyTable = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
  min-height: 120px;
  width: 100%;
`;

const StyledProgressContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
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
        <ObjectOverview
          targetableObject={targetableObject}
          isInRightDrawer={isInRightDrawer}
          isNewRightDrawerItemLoading={false}
          isPublication
        />
        <StyledRightContentContainer isInRightDrawer={isInRightDrawer}>
          <StyledProgressContainer>
            <CompletionProgress percentage={definedValuePercentage} />
          </StyledProgressContainer>
          <StyledSection>
            <StyledSectionTitle>
              <IconBuildingSkyscraper size={16} />
              {t`Status`}
            </StyledSectionTitle>
            <StyledSectionContent>
              <StatusBadge status={publication.stage} />
            </StyledSectionContent>
          </StyledSection>
          <StyledSection>
            <StyledSectionTitle>
              <IconMessageCircle2 size={16} />
              {t`Inquiries`}
            </StyledSectionTitle>
            <StyledSectionContent>
              {publicationMetrics?.contactsByStage ? (
                <StyledChartContainer>
                  <ContactsByStageChart
                    contactsByStage={publicationMetrics.contactsByStage}
                  />
                </StyledChartContainer>
              ) : (
                <StyledEmptyTable>
                  <Trans>No inquiries data available yet</Trans>
                </StyledEmptyTable>
              )}
            </StyledSectionContent>
          </StyledSection>
          <StyledSection>
            <StyledSectionTitle>
              <IconChartBar size={16} />
              {t`Reporting`}
            </StyledSectionTitle>
            <StyledSectionContent>
              <StyledComingSoonText>
                <Trans>Reporting coming soon</Trans>
              </StyledComingSoonText>
            </StyledSectionContent>
          </StyledSection>
        </StyledRightContentContainer>
      </StyledContentContainer>
    </>
  );
};

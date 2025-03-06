import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';

import { useMemo } from 'react';
import {
  IconBuildingSkyscraper,
  IconUsers,
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  IconCalendarStats,
  IconChartBar,
  IconMessageCircle2,
} from 'twenty-ui';
import { ObjectOverview } from './ObjectOverview';
import { CompletionProgress } from './publication/CompletionProgress';
import { KPICard } from './publication/KPICard';
import { css } from '@emotion/react';

const StyledContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledKPIGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const StyledChartPlaceholder = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  height: 200px;
  justify-content: center;
  width: 100%;
`;

const StyledTwoColumns = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: 1fr;
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledProgressContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 0 ${({ theme }) => theme.spacing(4)};
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

  if (recordLoading || !publication) {
    return (
      <StyledLoadingContainer>
        <Trans>Loading...</Trans>
      </StyledLoadingContainer>
    );
  }

  return (
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
        <StyledKPIGrid>
          <KPICard
            label={t`Inquiries`}
            value={publication.metrics?.inquiries || 0}
            icon={<IconMessageCircle2 size={16} />}
          />
          <KPICard
            label={t`Days Published`}
            value={publication.metrics?.daysPublished || 0}
            icon={<IconCalendarStats size={16} />}
          />
          <KPICard
            label={t`Status`}
            value={<StatusBadge status={publication.stage} />}
            icon={<IconBuildingSkyscraper size={16} />}
          />
        </StyledKPIGrid>
        <StyledSection>
          <StyledSectionTitle>
            <IconMessageCircle2 size={16} />
            {t`Recent Inquiries`}
          </StyledSectionTitle>
          <StyledSectionContent>
            <StyledEmptyTable>{t`No inquiries yet`}</StyledEmptyTable>
          </StyledSectionContent>
        </StyledSection>

        <StyledTwoColumns>
          <StyledSection>
            <StyledSectionTitle>
              <IconChartBar size={16} />
              {t`Price History`}
            </StyledSectionTitle>
            <StyledSectionContent>
              <StyledChartPlaceholder>
                {t`Price history chart coming soon`}
              </StyledChartPlaceholder>
            </StyledSectionContent>
          </StyledSection>

          <StyledSection>
            <StyledSectionTitle>
              <IconBuildingSkyscraper size={16} />
              {t`Similar Properties`}
            </StyledSectionTitle>
            <StyledSectionContent>
              <StyledEmptyTable>
                {t`No similar properties found`}
              </StyledEmptyTable>
            </StyledSectionContent>
          </StyledSection>
        </StyledTwoColumns>
      </StyledRightContentContainer>
    </StyledContentContainer>
  );
};

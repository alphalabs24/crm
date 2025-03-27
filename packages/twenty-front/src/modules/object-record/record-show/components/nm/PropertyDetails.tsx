import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { LARGE_DESKTOP_VIEWPORT } from 'twenty-ui';
import { ObjectOverview } from './ObjectOverview';

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
    <>
      <StyledContentContainer isInRightDrawer={isInRightDrawer}>
        <StyledLeftContentContainer isInRightDrawer={isInRightDrawer}>
          <ObjectOverview
            targetableObject={targetableObject}
            isInRightDrawer={isInRightDrawer}
            isNewRightDrawerItemLoading={false}
          />
        </StyledLeftContentContainer>
      </StyledContentContainer>
    </>
  );
};

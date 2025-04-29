import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

const StyledContainer = styled.div`
  margin: 0;
  width: 100%;
  @media (min-width: ${MOBILE_VIEWPORT}px) {
    margin: ${({ theme }) => theme.spacing(4)};
    width: unset;
  }
`;

type PropertyInquiriesListCardProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
};

export const PropertyInquiriesListCard = ({
  targetableObject,
}: PropertyInquiriesListCardProps) => {
  return (
    <StyledContainer>
      <PropertyInquiriesCard
        recordId={targetableObject.id}
        maxItems={15}
        showGraph={false}
      />
    </StyledContainer>
  );
};

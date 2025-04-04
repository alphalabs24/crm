import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PropertyInquiriesCard } from '@/object-record/record-show/components/nm/cards/PropertyInquiriesCard';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  width: 100%;
`;

type MobileInquiriesCardProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
};

export const MobileInquiriesCard = ({
  targetableObject,
}: MobileInquiriesCardProps) => {
  return (
    <StyledContainer>
      <PropertyInquiriesCard recordId={targetableObject.id} />
    </StyledContainer>
  );
};

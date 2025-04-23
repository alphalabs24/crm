import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PropertyPublicationsCard } from '@/object-record/record-show/components/nm/cards/PropertyPublicationsCard';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  width: 100%;
`;

type MobilePublicationsCardProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
};

export const MobilePublicationsCard = ({
  targetableObject,
}: MobilePublicationsCardProps) => {
  const { recordFromStore: property, recordLoading } =
    useRecordShowContainerData({
      objectNameSingular: targetableObject.targetObjectNameSingular,
      objectRecordId: targetableObject.id,
    });

  if (recordLoading || !property) {
    return null;
  }

  return (
    <StyledContainer>
      <PropertyPublicationsCard record={property} loading={recordLoading} />
    </StyledContainer>
  );
};

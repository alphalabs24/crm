import { CompletionProgress } from '@/object-record/record-show/components/nm/publication/CompletionProgress';
import { StyledProgressContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';

type PublicationCompletionCardProps = {
  record: any;
};

export const PublicationCompletionCard = ({
  record,
}: PublicationCompletionCardProps) => {
  return (
    <StyledProgressContainer>
      <CompletionProgress record={record} />
    </StyledProgressContainer>
  );
};

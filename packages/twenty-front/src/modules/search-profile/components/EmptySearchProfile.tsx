import styled from '@emotion/styled';
import { Button } from 'twenty-ui';

const StyledEmptyContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  width: 100%;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type EmptySearchProfileProps = {
  onCreateSearchProfile: () => void;
};

export const EmptySearchProfile = ({
  onCreateSearchProfile,
}: EmptySearchProfileProps) => {
  return (
    <StyledEmptyContainer>
      <StyledTitle>No search profile found</StyledTitle>
      <StyledDescription>
        Create a search profile to define your preferred locations
      </StyledDescription>
      <Button title="Create Search Profile" onClick={onCreateSearchProfile} />
    </StyledEmptyContainer>
  );
};

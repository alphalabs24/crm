import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, IconHomeSearch, IconInfoCircle } from 'twenty-ui';

const StyledEmptyContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 400px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  width: 100%;
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 550px;
`;

type EmptySearchProfileProps = {
  onCreateSearchProfile: () => void;
};

export const EmptySearchProfile = ({
  onCreateSearchProfile,
}: EmptySearchProfileProps) => {
  const { t } = useLingui();
  return (
    <StyledEmptyContainer>
      <StyledTitle>
        <IconHomeSearch size={20} />
        <Trans>Create Search Profile</Trans>
      </StyledTitle>
      <StyledDescription>
        <Trans>
          A search profile will help you find properties that match the criteria
          you've set in order to identify potential opportunities.
        </Trans>
      </StyledDescription>
      <Button
        title={t`Configure Search Profile`}
        onClick={onCreateSearchProfile}
      />
    </StyledEmptyContainer>
  );
};

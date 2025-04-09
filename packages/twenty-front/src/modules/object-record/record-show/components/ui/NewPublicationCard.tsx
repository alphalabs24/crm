import { useNestermind } from '@/api/hooks/useNestermind';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
    PlatformId,
    PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, IconPlus } from 'twenty-ui';

const StyledPublicationGroupContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  max-width: 350px;
  min-width: 200px;
  flex: 1;
  min-height: 120px;
  justify-content: space-between;
`;

const StyledNewPublicationCardHeaderTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledNewPublicationCardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCallToAction = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledNewPublicationCardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledNewPublicationCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type NewPublicationCardProps = {
  platform: PlatformId;
  onClick: () => void;
  propertyId: string;
  refetchCallback?: () => Promise<any>;
};

export const NewPublicationCard = ({
  platform,
  onClick,
  propertyId,
  refetchCallback,
}: NewPublicationCardProps) => {
  const { t } = useLingui();
  const { useMutations } = useNestermind();
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const location = useLocation();
  const currentHash = location.hash;

  const { mutate: createPublicationDraft, isPending } =
    useMutations.useCreatePublicationDraft({
      onSuccess: async () => {
        enqueueSnackBar(t`Publication Draft created successfully`, {
          variant: SnackBarVariant.Success,
        });

        // Refetch publications data to get the newly created publication
        if (refetchCallback) {
          await refetchCallback();
        }

        // Navigate to the new publication using the current URL strategy with search params
        const newParams = new URLSearchParams();
        newParams.set('platform', platform);

        navigate({
          pathname: location.pathname,
          search: newParams.toString(),
          hash: currentHash,
        });
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || t`Failed to create draft`, {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const handleCreatePublication = () => {
    createPublicationDraft({
      propertyId,
      platform,
    });
  };

  return (
    <StyledPublicationGroupContainer>
      <StyledNewPublicationCardContent>
        <StyledNewPublicationCardHeader>
          <StyledNewPublicationCardHeaderTitle>
            {PLATFORMS[platform].name}
          </StyledNewPublicationCardHeaderTitle>
          <PlatformBadge platformId={platform} variant="no-background" />
        </StyledNewPublicationCardHeader>
        <StyledNewPublicationCardDescription>
          {PLATFORMS[platform].description}
        </StyledNewPublicationCardDescription>
      </StyledNewPublicationCardContent>
      <StyledCallToAction>
        <Button
          variant="secondary"
          size="small"
          title={t`Create new publication`}
          Icon={IconPlus}
          onClick={handleCreatePublication}
          disabled={isPending}
        />
      </StyledCallToAction>
    </StyledPublicationGroupContainer>
  );
};

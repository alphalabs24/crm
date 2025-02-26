import { tokenPairState } from '@/auth/states/tokenPairState';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  PlatformId,
  PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import styled from '@emotion/styled';
import axios from 'axios';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Button,
  CircularProgressBar,
  IconCheck,
  IconExternalLink,
} from 'twenty-ui';

const StyledPublishingProcess = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

const StyledPlatformPublishItem = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPlatformPublishIcon = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  width: 32px;
`;

const StyledPlatformPublishInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPlatformPublishName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPlatformPublishStatus = styled.div<{ isPublished?: boolean }>`
  color: ${({ theme, isPublished }) =>
    isPublished ? theme.color.green50 : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPlatformPublishStatusIcon = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 24px;
  color: ${({ theme }) => theme.color.green};
`;

const StyledViewPublicationButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type PublishingProps = {
  selectedPlatform: PlatformId;
  renderPlatformIcon: (platformId: PlatformId) => React.ReactNode;
  recordId: string;
};

// TODO: use this once we publish to a platform
export const Publishing = ({
  selectedPlatform,
  renderPlatformIcon,
  recordId,
}: PublishingProps) => {
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackBar } = useSnackBar();
  const tokenPair = useRecoilValue(tokenPairState);

  const { recordFromStore: record } = useRecordShowContainerData({
    objectNameSingular: 'publication',
    objectRecordId: recordId,
  });

  const publishDraft = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${window._env_?.REACT_APP_PUBLICATION_SERVER_BASE_URL ?? 'http://api.localhost'}/publications/upload?id=${recordId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        },
      );
      if (response.status !== 201) {
        throw new Error('Failed to publish');
      }
      setIsPublished(true);
      enqueueSnackBar(`Publication created successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <StyledPublishingProcess>
      <StyledPlatformPublishItem key={selectedPlatform}>
        <StyledPlatformPublishIcon>
          {renderPlatformIcon(selectedPlatform)}
        </StyledPlatformPublishIcon>
        <StyledPlatformPublishInfo>
          <StyledPlatformPublishName>
            {PLATFORMS[selectedPlatform].name}
          </StyledPlatformPublishName>
          <StyledPlatformPublishStatus isPublished={isPublished}>
            {isPublished ? (
              <>
                Successfully published
                <IconCheck size={14} />
              </>
            ) : isLoading ? (
              'Publishing...'
            ) : (
              'Unpublished'
            )}
          </StyledPlatformPublishStatus>
        </StyledPlatformPublishInfo>
        <StyledPlatformPublishStatusIcon>
          {isPublished ? (
            <StyledViewPublicationButton>
              View Publication
              <IconExternalLink size={14} />
            </StyledViewPublicationButton>
          ) : isLoading ? (
            <CircularProgressBar size={16} barWidth={2} barColor="black" />
          ) : (
            <Button
              variant="primary"
              accent="blue"
              title={`Publish`}
              onClick={publishDraft}
            />
          )}
        </StyledPlatformPublishStatusIcon>
      </StyledPlatformPublishItem>
    </StyledPublishingProcess>
  );
};

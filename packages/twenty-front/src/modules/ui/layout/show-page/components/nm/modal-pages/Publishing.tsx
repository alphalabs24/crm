import { useNestermind } from '@/api/hooks/useNestermind';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  PlatformId,
  PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  CircularProgressBar,
  IconCheck,
  IconExternalLink,
} from 'twenty-ui';
import { ValidationResult } from '../../../hooks/usePublicationValidation';

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

const StyledPublishedInfo = styled.div`
  align-items: flex-end;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledViewPublicationButton = styled(Link)`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledValidationDetails = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.danger};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEditLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type PublishingProps = {
  selectedPlatform: PlatformId;
  renderPlatformIcon: (platformId: PlatformId) => React.ReactNode;
  recordId: string;
  validationDetails: ValidationResult;
  isPublished: boolean;
  setIsPublished: (isPublished: boolean) => void;
};

export const Publishing = ({
  selectedPlatform,
  renderPlatformIcon,
  recordId,
  validationDetails,
  isPublished,
  setIsPublished,
}: PublishingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();
  const [showError, setShowError] = useState(false);

  const { record, refetch } = useFindOneRecord({
    objectNameSingular: 'publication',
    objectRecordId: recordId,
  });

  const {
    propertiesApi: { syncPublications },
  } = useNestermind();

  const publishDraft = async () => {
    try {
      if (validationDetails?.missingFields?.length > 0) {
        setShowError(true);
        return;
      }
      setIsLoading(true);

      const response = await syncPublications(recordId);

      if (response.status !== 201) {
        throw new Error('Failed to publish');
      }
      setIsPublished(true);
      enqueueSnackBar(`Publication created successfully`, {
        variant: SnackBarVariant.Success,
      });
      await refetch();
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
                {t`Successfully published`}*
                <IconCheck size={14} />
              </>
            ) : isLoading ? (
              t`Publishing...`
            ) : (
              t`Unpublished`
            )}
          </StyledPlatformPublishStatus>
        </StyledPlatformPublishInfo>
        {showError && (
          <StyledValidationDetails>
            {validationDetails?.message}
            <StyledEditLink
              to={`${getLinkToShowPage('publication', { id: recordId })}/edit`}
            >
              {t`Edit`}
            </StyledEditLink>
          </StyledValidationDetails>
        )}
        <StyledPlatformPublishStatusIcon>
          {isPublished ? (
            record?.agency.newhomePartnerId ? (
              <StyledViewPublicationButton
                to={`https://test.newhome.ch/partner/${record?.agency.newhomePartnerId}.aspx`}
                target="_blank"
              >
                {t`View Publications`}
                <IconExternalLink size={14} />
              </StyledViewPublicationButton>
            ) : null
          ) : isLoading ? (
            <CircularProgressBar size={16} barWidth={2} barColor="black" />
          ) : (
            <Button
              variant="primary"
              accent="blue"
              title={t`Publish`}
              onClick={publishDraft}
            />
          )}
        </StyledPlatformPublishStatusIcon>
      </StyledPlatformPublishItem>
      {isPublished && (
        <StyledPublishedInfo>
          <Trans>
            *It can take up to 10 minutes until publications are visible.
          </Trans>
        </StyledPublishedInfo>
      )}
    </StyledPublishingProcess>
  );
};

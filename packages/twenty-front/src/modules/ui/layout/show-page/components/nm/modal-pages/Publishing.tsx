import { useNestermind } from '@/api/hooks/useNestermind';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { AgencyCredential } from '@/publishers/components/modals/EditPublisherModal';
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
  hasDraftAndPublished: boolean;
};

export const Publishing = ({
  selectedPlatform,
  renderPlatformIcon,
  recordId,
  validationDetails,
  isPublished,
  setIsPublished,
  hasDraftAndPublished,
}: PublishingProps) => {
  const [showError, setShowError] = useState(false);
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { record, refetch } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Publication,
    objectRecordId: recordId,
  });

  const { records: credentialRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Credential,
    filter: {
      name: {
        eq: selectedPlatform,
      },
      agencyId: {
        eq: record?.agencyId,
      },
    },
    skip: !record?.agencyId,
  });

  const { useMutations } = useNestermind();

  // Using the mutation hook for publish
  const { mutate: publishPublication, isPending: isLoading } =
    useMutations.usePublishPublication({
      onSuccess: () => {
        setIsPublished(true);
        enqueueSnackBar(`Publication created successfully`, {
          variant: SnackBarVariant.Success,
        });
        refetch();
      },
      onError: (error: Error) => {
        enqueueSnackBar(error?.message || 'Failed to publish', {
          variant: SnackBarVariant.Error,
        });
      },
    });

  const publishDraft = async () => {
    if (validationDetails?.missingFields?.length > 0) {
      setShowError(true);
      return;
    }

    publishPublication({ publicationId: recordId });
  };

  const platform = PLATFORMS[selectedPlatform];

  const offerListLink =
    platform.getOfferListLink && credentialRecords.length > 0
      ? platform.getOfferListLink(
          credentialRecords[0] as unknown as AgencyCredential,
        )
      : null;

  return (
    <StyledPublishingProcess>
      <StyledPlatformPublishItem key={selectedPlatform}>
        <StyledPlatformPublishIcon>
          {renderPlatformIcon(selectedPlatform)}
        </StyledPlatformPublishIcon>
        <StyledPlatformPublishInfo>
          <StyledPlatformPublishName>{platform.name}</StyledPlatformPublishName>
          <StyledPlatformPublishStatus isPublished={isPublished}>
            {isPublished ? (
              <>
                {t`Successfully published`}*
                <IconCheck size={14} />
              </>
            ) : isLoading ? (
              t`Publishing...`
            ) : hasDraftAndPublished ? (
              t`Published`
            ) : (
              t`Unpublished`
            )}
          </StyledPlatformPublishStatus>
        </StyledPlatformPublishInfo>
        {showError && (
          <StyledValidationDetails>
            {validationDetails?.message}
            <StyledEditLink
              to={
                validationDetails?.path ??
                `${getLinkToShowPage('publication', { id: recordId })}/edit`
              }
            >
              {t`Edit`}
            </StyledEditLink>
          </StyledValidationDetails>
        )}
        <StyledPlatformPublishStatusIcon>
          {isPublished ? (
            offerListLink ? (
              <StyledViewPublicationButton to={offerListLink} target="_blank">
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
              title={hasDraftAndPublished ? t`Republish` : t`Publish`}
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

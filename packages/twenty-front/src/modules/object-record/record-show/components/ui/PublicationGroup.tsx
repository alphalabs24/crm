import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  PlatformId,
  PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useDraftPublishedDifferences } from '@/ui/layout/show-page/hooks/useDraftPublishedDifferences';
import styled from '@emotion/styled';
import { IconButton, IconRefresh } from 'twenty-ui';

const StyledPublicationGroupContainer = styled.button`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
  }
`;

const StyledPublicationGroupHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledActionsSection = styled.div`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledPublicationGroupHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPublicationGroupTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledPublicationGroupHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPropertyImageContainer = styled.div`
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  background-color: ${({ theme }) => theme.background.tertiary};
`;

const StyledIconButton = styled(IconButton)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledPlatformInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDifferenceBadge = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.blue};
  border: 1px solid ${({ theme }) => theme.color.blue};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 2)};
`;

const StyledDifferenceText = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type PublicationGroupProps = {
  platform: PlatformId;
  draftRecord?: ObjectRecord;
  publishedRecord?: ObjectRecord;
  stage?: PublicationStage;
  onClick?: () => void;
};

export const PublicationGroup = ({
  platform,
  draftRecord,
  publishedRecord,
  stage,
  onClick,
}: PublicationGroupProps) => {
  const { hasDifferences, totalDifferenceCount } = useDraftPublishedDifferences(
    draftRecord,
    publishedRecord,
  );

  return (
    <StyledPublicationGroupContainer onClick={onClick}>
      <StyledPublicationGroupHeader>
        <StyledPublicationGroupHeaderLeft>
          <StyledPlatformInfo>
            <StyledPublicationGroupTitle>
              {PLATFORMS[platform].name}
            </StyledPublicationGroupTitle>
            <PlatformBadge
              platformId={platform}
              size="small"
              variant="no-background"
            />
          </StyledPlatformInfo>
        </StyledPublicationGroupHeaderLeft>

        <StyledPublicationGroupHeaderRight>
          {hasDifferences ? (
            <StyledDifferenceBadge>
              <IconRefresh size={12} />

              <StyledDifferenceText>
                {totalDifferenceCount === 1
                  ? '1 unpublished change'
                  : `${totalDifferenceCount} unpublished changes`}
              </StyledDifferenceText>
            </StyledDifferenceBadge>
          ) : (
            stage && <StatusBadge status={stage} />
          )}
        </StyledPublicationGroupHeaderRight>
      </StyledPublicationGroupHeader>
    </StyledPublicationGroupContainer>
  );
};

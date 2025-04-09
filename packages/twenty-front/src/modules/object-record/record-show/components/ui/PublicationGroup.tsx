import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
    PlatformId,
    PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronRight } from 'twenty-ui';

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

const StyledPropertyImage = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const StyledPlatformInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type PublicationGroupProps = {
  platform: PlatformId;
  records: ObjectRecord[];
  stage?: PublicationStage;
  onClick?: () => void;
};

export const PublicationGroup = ({
  platform,
  records,
  stage,
  onClick,
}: PublicationGroupProps) => {
  const theme = useTheme();

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
          {stage && <StatusBadge status={stage} />}
          <IconChevronRight size={20} color={theme.font.color.tertiary} />
        </StyledPublicationGroupHeaderRight>
      </StyledPublicationGroupHeader>
    </StyledPublicationGroupContainer>
  );
};

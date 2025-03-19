import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledItemContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const PlatformCredentialItemSkeleton = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledItemContainer>
        <StyledHeader>
          <StyledLeftContent>
            <Skeleton width={24} height={24} circle />
            <Skeleton width={120} height={20} />
          </StyledLeftContent>
          <Skeleton width={16} height={16} />
        </StyledHeader>
      </StyledItemContainer>
    </SkeletonTheme>
  );
};

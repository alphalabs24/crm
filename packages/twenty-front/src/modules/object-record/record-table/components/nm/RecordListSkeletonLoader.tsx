import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const StyledSkeletonCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  padding: ${({ theme }) => theme.spacing(1.5)};
  position: relative;
`;

const StyledSkeletonImageSection = styled.div`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  position: relative;
`;

const StyledSkeletonContentSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(0.5, 0)};
  justify-content: center;
`;

const StyledSkeletonUpperSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const RecordListSkeletonCard = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonCard>
        <StyledSkeletonImageSection />
        <StyledSkeletonContentSection>
          <StyledSkeletonUpperSection>
            <Skeleton width={80} height={12} />
            <Skeleton width="30%" height={24} />
            <Skeleton width="50%" height={20} />
            <Skeleton width="50%" height={30} />
          </StyledSkeletonUpperSection>
        </StyledSkeletonContentSection>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};

export const RecordListSkeletonLoader = () => {
  const skeletonItems = Array.from({ length: 10 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));

  return (
    <>
      {skeletonItems.map(({ id }) => (
        <RecordListSkeletonCard key={id} />
      ))}
    </>
  );
};

import { useInquiries } from '@/inquiries/hooks/useInquiries';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { InquiryItem } from './InquiryItem';

const StyledPageBody = styled(PageBody)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

// Create styled components for skeleton loader
const StyledSkeletonCard = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledSkeletonProfileSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSkeletonProfilePicture = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  height: 40px;
  width: 40px;
`;

const StyledSkeletonRelationshipSection = styled.div`
  margin-left: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

// Create a skeleton card loader component
const InquirySkeletonItem = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonCard>
        <StyledSkeletonHeader>
          <StyledSkeletonProfileSection>
            <StyledSkeletonProfilePicture />
            <Skeleton width={120} height={16} />
          </StyledSkeletonProfileSection>
          <Skeleton width={80} height={12} />
        </StyledSkeletonHeader>
        <StyledSkeletonRelationshipSection>
          <Skeleton width={180} height={16} />
        </StyledSkeletonRelationshipSection>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};

// Create a skeleton loader for the list
const InquirySkeletonLoader = () => {
  const skeletonItems = Array.from({ length: 5 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));

  return (
    <StyledList>
      {skeletonItems.map(({ id }) => (
        <InquirySkeletonItem key={id} />
      ))}
    </StyledList>
  );
};

export const InquiriesList = () => {
  const { records, loading } = useInquiries();

  const recordsWithPersonAndPublication = useMemo(() => {
    return records.filter((record) => record.person && record.publication);
  }, [records]);

  if (loading) {
    return (
      <StyledPageBody>
        <ScrollWrapper
          componentInstanceId="inquiries-list"
          contextProviderName="inquiriesList"
        >
          <InquirySkeletonLoader />
        </ScrollWrapper>
      </StyledPageBody>
    );
  }

  if (recordsWithPersonAndPublication.length === 0) {
    return (
      <StyledPageBody>
        <StyledEmptyState>No inquiries found</StyledEmptyState>
      </StyledPageBody>
    );
  }

  return (
    <StyledPageBody>
      <ScrollWrapper
        componentInstanceId="inquiries-list"
        contextProviderName="inquiriesList"
      >
        <StyledList>
          {recordsWithPersonAndPublication.map((record, index) => (
            <InquiryItem
              id={record.id}
              key={record.id}
              inquiry={record}
              isLast={index === recordsWithPersonAndPublication.length - 1}
            />
          ))}
        </StyledList>
      </ScrollWrapper>
    </StyledPageBody>
  );
};

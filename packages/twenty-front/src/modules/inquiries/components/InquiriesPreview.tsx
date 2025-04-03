import { useInquiries } from '@/inquiries/hooks/useInquiries';
import { AppPath } from '@/types/AppPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link } from 'react-router-dom';
import { IconMessageCircle2 } from 'twenty-ui';
import { InquiryItem } from './InquiryItem';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledSectionTitle = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledViewAll = styled(Link)`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledUnstyledLink = styled(Link)`
  text-decoration: none;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
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

type InquiriesPreviewProps = {
  publicationId?: string;
  propertyId?: string;
  maxItems?: number;
};

export const InquiriesPreview = ({
  publicationId,
  propertyId,
  maxItems = 5,
}: InquiriesPreviewProps) => {
  const { t } = useLingui();
  const { records, loading } = useInquiries({ publicationId, propertyId });

  const recordsWithPersonAndPublication = useMemo(() => {
    return records
      .filter((record) => record.person && record.publication)
      .slice(0, maxItems);
  }, [records, maxItems]);

  if (loading) {
    return (
      <StyledSection>
        <StyledSectionHeader>
          <StyledSectionTitle>
            <Trans>Latest Inquiries</Trans>
          </StyledSectionTitle>
        </StyledSectionHeader>
        <InquirySkeletonLoader />
      </StyledSection>
    );
  }

  if (recordsWithPersonAndPublication.length === 0) {
    return (
      <StyledSection>
        <StyledSectionHeader>
          <StyledSectionTitle>
            <Trans>Latest Inquiries</Trans>
          </StyledSectionTitle>
        </StyledSectionHeader>
        <StyledEmptyState>
          <IconMessageCircle2 size={24} />
          <Trans>No inquiries data available yet</Trans>
        </StyledEmptyState>
      </StyledSection>
    );
  }

  return (
    <StyledSection>
      <StyledSectionHeader>
        <StyledSectionTitle>
          <Trans>Latest Inquiries</Trans>
        </StyledSectionTitle>
        <StyledViewAll to={AppPath.RecordInquiriesPage}>
          <Trans>View all</Trans>
        </StyledViewAll>
      </StyledSectionHeader>
      <StyledList>
        {recordsWithPersonAndPublication.map((record, index) => (
          <StyledUnstyledLink
            to={`${AppPath.RecordInquiriesPage}?id=${record.id}`}
          >
            <InquiryItem
              key={record.id}
              inquiry={record}
              isLast={index === recordsWithPersonAndPublication.length - 1}
            />
          </StyledUnstyledLink>
        ))}
      </StyledList>
    </StyledSection>
  );
};
